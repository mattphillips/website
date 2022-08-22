import React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  useSandpack,
  SandpackStack,
  RunIcon,
  useSandpackTheme,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import classNames from "classnames";
import immer from "immer";
// @ts-ignore
import ansiHTML from "ansi-html";
import { set, get, setWith } from "lodash";

// TODO: Check todos in sandpack.tsx

const generateRandomId = (): string => Math.floor(Math.random() * 10000).toString();
export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const formatDiffMessage = (error: TestError, path: string) => {
  let finalMessage: string = "";
  if (error.matcherResult) {
    finalMessage = `<span>${escapeHtml(error.message)
      .replace(/(expected)/m, `<span style="color:green">$1</span>`)
      .replace(/(received)/m, `<span style="color:red">$1</span>`)
      .replace(/(Difference:)/m, `<span>$1</span>`)
      .replace(/(Expected.*\n)(.*)/m, `<span>$1</span><span style="color:green">$2</span>`)
      .replace(/(Received.*\n)(.*)/m, `<span>$1</span><span style="color:red">$2</span>`)
      .replace(/^(-.*)/gm, `<span style="color:red">$1</span>`)
      .replace(/^(\+.*)/gm, `<span style="color:green">$1</span>`)}</span>`;
  } else {
    finalMessage = escapeHtml(error.message + "\n\n" + error.stack);
  }

  finalMessage = ansiHTML(finalMessage);

  if (
    error.mappedErrors &&
    error.mappedErrors[0] &&
    error.mappedErrors[0].fileName.endsWith(path) &&
    error.mappedErrors[0]._originalScriptCode
  ) {
    const mappedError = error.mappedErrors[0] as any;

    const widestNumber =
      Math.max(...mappedError._originalScriptCode.map((code: any) => (code.lineNumber + "").length)) + 2;
    const margin = Array.from({ length: widestNumber }).map(() => " ");

    finalMessage += "<br />";
    finalMessage += "<br />";
    finalMessage += "<div>";
    mappedError._originalScriptCode
      .filter((x: any) => x.content.trim())
      .forEach((code: any) => {
        const currentLineMargin = (code.lineNumber + "").length;
        const newMargin = [...margin];
        newMargin.length -= currentLineMargin;
        if (code.highlight) {
          newMargin.length -= 2;
        }

        finalMessage +=
          `<div ${code.highlight ? `style="font-weight:900;"` : ``}>` +
          (code.highlight ? `<span style="color:red;">></span> ` : "") +
          newMargin.join("") +
          escapeHtml("" + code.lineNumber) +
          " | " +
          escapeHtml(code.content) +
          "</div>";
      });
    finalMessage += "</div>";
  }

  return finalMessage.replace(/(?:\r\n|\r|\n)/g, "<br />");
};

export type Status = "idle" | "running" | "pass" | "fail";

export type TestError = Error & {
  matcherResult?: boolean;
  mappedErrors?: Array<{
    fileName: string;
    _originalFunctionName: string;
    _originalColumnNumber: number;
    _originalLineNumber: number;
    _originalScriptCode: Array<{
      lineNumber: number;
      content: string;
      highlight: boolean;
    }> | null;
  }>;
};

export type Test = {
  name: string;
  blocks: string[];
  status: Status;
  running: boolean;
  path: string;
  errors: TestError[];
  duration?: number | undefined;
};

export type Describe = {
  name: string;
  tests: {
    [testName: string]: Test;
  };
  describes: {
    [describeName: string]: Describe;
  };
};

export type File = {
  fileName: string;
  fileError?: TestError;
  tests: {
    [testName: string]: Test;
  };
  describes: {
    [describeName: string]: Describe;
  };
};

type State = {
  files: { [path: string]: File };
  running: boolean;
};

const INITIAL_STATE: State = {
  files: {},
  running: false,
};

// Sandbox wrapper of jest-cirucs: https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/sandbox/eval/tests/jest-lite.ts
// This is the sandbox component impl: https://github.com/codesandbox/codesandbox-client/blob/389073613e06eee944231f4aeef9dfa746c1b947/packages/app/src/app/components/Preview/DevTools/Tests/index.tsx
// All message types for tests: https://github.com/codesandbox/codesandbox-client/blob/master/packages/common/src/utils/jest-lite.ts
const SandpackTests: React.FC<{}> = ({}) => {
  const { sandpack, listen } = useSandpack();
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const clientId = React.useRef<string>(generateRandomId());
  const [state, setState] = React.useState<State>(INITIAL_STATE);

  let currentDescribeBlocks: Array<string> = [];
  let currentFile: string = "";

  React.useEffect(() => {
    const iframeElement = iframeRef.current!;
    const clientIdValue = clientId.current;

    sandpack.registerBundler(iframeElement, clientIdValue);

    // TODO: You've not handle the external status updates in the live impl
    const unsubscribe = listen((data: any) => {
      console.log("Message", data);

      if (data.type === "action" && data.action === "clear-errors" && data.source === "jest") {
        currentFile = data.path;
      }

      if (data.type === "test") {
        if (data.event === "initialize_tests") {
          currentDescribeBlocks = [];
          currentFile = "";
          return setState(INITIAL_STATE);
        }

        if (data.event === "test_count") {
          return;
        }

        if (data.event === "total_test_start") {
          currentDescribeBlocks = [];
          return setState((old) => ({ ...old, running: true }));
        }

        if (data.event === "total_test_end") {
          return setState((old) => ({ ...old, running: false }));
        }

        if (data.event === "add_file") {
          return setState((oldState) =>
            immer(oldState, (state) => {
              state.files[data.path] = {
                describes: {},
                tests: {},
                fileName: data.path,
              };
            })
          );
        }

        if (data.event === "remove_file") {
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (state.files[data.path]) {
                delete state.files[data.path];
              }
            })
          );
        }

        if (data.event === "file_error") {
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (state.files[data.path]) {
                state.files[data.path].fileError = data.error;
              }
            })
          );
        }

        if (data.event === "describe_start") {
          currentDescribeBlocks.push(data.blockName);
          const head = currentDescribeBlocks.slice(0, currentDescribeBlocks.length - 1);
          const tail = currentDescribeBlocks[currentDescribeBlocks.length - 1];
          const file = currentFile;

          return setState((oldState) =>
            immer(oldState, (state) => {
              set(state.files[file], ["describes", ...head.flatMap((name) => [name, "describes"]), tail], {
                name: data.blockName,
                tests: {},
                describes: {},
              });
            })
          );
        }

        if (data.event === "describe_end") {
          return currentDescribeBlocks.pop();
        }

        if (data.event === "add_test") {
          const head = currentDescribeBlocks.slice(0, currentDescribeBlocks.length - 1);
          const tail = currentDescribeBlocks[currentDescribeBlocks.length - 1];
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[data.path].tests[data.testName] = {
                  status: "idle",
                  errors: [],
                  name: data.testName,
                  blocks: [...head, tail],
                  path: data.path,
                  running: false,
                };
              } else {
                set(
                  state.files[data.path].describes,
                  [...head.flatMap((name) => [name, "describes"]), tail, "tests", data.testName],
                  {
                    status: "idle",
                    errors: [],
                    name: data.testName,
                    blocks: [...head, tail],
                    path: data.path,
                    running: false,
                  }
                );
              }
            })
          );
        }

        if (data.event === "test_start") {
          const { test } = data;
          const head = test.blocks.slice(0, test.blocks.length - 1);
          const tail = test.blocks[test.blocks.length - 1];

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[test.path].tests[test.name] = {
                  status: "running",
                  running: true,
                  name: test.name,
                  blocks: [...head, tail],
                  path: test.path,
                  errors: [],
                };
              } else {
                set(
                  state.files[test.path].describes,
                  [...head.flatMap((name: string) => [name, "describes"]), tail, "tests", test.name],
                  {
                    status: "running",
                    running: true,
                    name: test.name,
                    blocks: [...head, tail],
                    path: test.path,
                    errors: [],
                  }
                );
              }
            })
          );
        }

        if (data.event === "test_end") {
          const { test } = data;
          const head = test.blocks.slice(0, test.blocks.length - 1);
          const tail = test.blocks[test.blocks.length - 1];

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[test.path].tests[test.name] = {
                  status: test.status,
                  running: false,
                  errors: test.errors,
                  duration: test.duration,
                  name: test.name,
                  blocks: [...head, tail],
                  path: test.path,
                };
              } else {
                set(
                  state.files[test.path].describes,
                  [...head.flatMap((name: string) => [name, "describes"]), tail, "tests", test.name],
                  {
                    status: test.status,
                    running: false,
                    errors: test.errors,
                    duration: test.duration,
                    name: test.name,
                    blocks: [...head, tail],
                    path: test.path,
                  }
                );
              }
            })
          );
        }
      }
    });

    return () => {
      unsubscribe();
      sandpack.unregisterBundler(clientIdValue);
    };
  }, []);

  const runAllTests = () => {
    setState((old) => ({ ...old, running: true, files: {} }));
    Object.values(sandpack.clients).forEach((client) => {
      client.dispatch({ type: "run-all-tests" } as any);
    });
  };

  const openFile = (file: string) => {
    sandpack.setActiveFile(file);
  };

  console.log("State", state);

  const files = Object.values(state.files);

  const duration = files.flatMap(getTests).reduce((acc, test) => acc + (test.duration || 0), 0);

  const allTests = Object.values(state.files)
    .map(getStats)
    .reduce(
      (acc, stats) => {
        return {
          pass: acc.pass + stats.pass,
          fail: acc.fail + stats.fail,
          skip: acc.skip + stats.skip,
          total: acc.total + stats.total,
        };
      },
      { pass: 0, skip: 0, fail: 0, total: 0 }
    );

  return (
    <SandpackStack style={{ height: "70vh" }}>
      <iframe ref={iframeRef} className="hidden" />
      <div className="flex border-b border-solid border-[#44475a] min-h-[40px] px-4 py-2 justify-between">
        <button className="flex items-center bg-gray-700 text-gray-50 pl-1 pr-3 rounded-lg" onClick={runAllTests}>
          <RunIcon />
          Run
        </button>

        {state.running && (
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>
      <div className="p-4 overflow-auto h-full flex flex-col font-[Consolas,_Monaco,_monospace]">
        {Object.values(state.files).map((file) => {
          /* TODO: Don't recompute this here */

          const stats = getStats(file);

          return (
            <div className="mb-2">
              {!state.running &&
                (stats.fail > 0 ? (
                  <span className="px-2 py-1 bg-red-500 mr-2 font-[Consolas,_Monaco,_monospace]">FAIL</span>
                ) : (
                  <span className="px-2 py-1 bg-green-500 mr-2 font-[Consolas,_Monaco,_monospace]">PASS</span>
                ))}
              <button className="mb-2 decoration-dotted underline" onClick={() => openFile(file.fileName)}>
                {file.fileName}
              </button>

              {Object.values(file.tests).map((test) => (
                <Test test={test} />
              ))}

              {Object.values(file.describes).map((describe) => (
                <Describe describe={describe} />
              ))}
            </div>
          );
        })}
        {/* TODO: Add more states to the model */}
        {!state.running && allTests.total > 0 && (
          <div className="text-gray-400">
            <div className="mb-2">
              <span className="font-bold text-white">Tests:</span>{" "}
              <span className="text-red-500">{allTests.fail} failed</span>,{" "}
              <span className="text-yellow-500">{allTests.skip} skipped</span>,{" "}
              <span className="text-green-500">{allTests.pass} passed</span>, {allTests.total} total
            </div>
            <div className="font-bold text-white">Time: {duration} ms</div>
          </div>
        )}
      </div>
    </SandpackStack>
  );
};

const getTests = (block: Describe | File): Array<Test> => {
  const tests = Object.values(block.tests);
  return tests.concat(...Object.values(block.describes).map(getTests));
};

const getStats = (file: File) => {
  const allTests = getTests(file);

  const sum = (tests: Test[]): { pass: number; fail: number; skip: number; total: number } =>
    tests.reduce(
      (acc, test) => {
        return {
          pass: test.status === "pass" ? acc.pass + 1 : acc.pass,
          fail: test.status === "fail" ? acc.fail + 1 : acc.fail,
          skip: test.status === "idle" || test.status === "running" ? acc.skip + 1 : acc.skip,
          total: acc.total + 1,
        };
      },
      { pass: 0, fail: 0, skip: 0, total: 0 }
    );

  return sum(allTests);
};

const Describe: React.FC<{ describe: Describe }> = ({ describe }) => {
  if (Object.values(describe.describes).length === 0 && Object.values(describe.tests).length === 0) {
    return null;
  }

  return (
    <div className="ml-4">
      <div className="">
        <div className={classNames("mb-2 text-white", {})}>{describe.name}</div>

        {Object.values(describe.tests).map((test) => (
          <Test test={test} />
        ))}

        {Object.values(describe.describes).map((d) => (
          <Describe describe={d} />
        ))}
      </div>
    </div>
  );
};

const Test: React.FC<{ test: Test }> = ({ test }) => {
  return (
    <div className="ml-4">
      <div className={classNames("mb-2 text-gray-400", {})}>
        {test.status === "pass" && <span className="mr-2 text-green-500">✓</span>}
        {test.status === "fail" && <span className="mr-2 text-red-500">✕</span>}
        {test.status === "idle" && <span className="mr-2 text-yellow-500">○</span>}
        {test.name}
        {test.duration !== undefined && <span className="ml-2">({test.duration} ms)</span>}
      </div>
      {test.errors.map((e) => {
        return (
          <div
            className="p-4 text-sm leading-[1.6] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatDiffMessage(e, test.path) }}
          ></div>
        );
      })}
    </div>
  );
};

const addTests = `import * as matchers from 'jest-extended';
import {add} from './add';
expect.extend(matchers);

test('Root of file test', () => {
  expect(add(1, 2)).toBe(add(2, 1)); 
})

describe('extending expect', () => {
  describe('add', () => {
    test.skip('Skipped test', () => {
      expect(true).toBe(false);
    });

    test('Commutative Law of Addition', () => {
      expect(add(1, 2)).toBe(add(2, 1));
    });

    test('Slow test', async () => {
      await new Promise(res => setTimeout(res, 2000));
      expect(true).toBe(true);
    });

    describe('Nested describe block', () => {
      test('adding two odd numbers gives an even number', () => {
        expect(add(1, 3)).toBeEven();
      });

      describe('Double nested describe block', () => {
        test('adding two odd numbers gives an even number', () => {
          expect(add(1, 3)).toBeEven();
        });
      });
    });
  });
});

describe('Sibling describe block', () => {
  test('adding two even numbers does not give an odd number', () => {
    expect(add(1, 3)).not.toBeOdd();
  });    
});

describe('Empty describe block', () => {});
`;

const subTests = `import {sub} from './sub';

describe('Subtract', () => {
  test('1 - 1 = 0', () => {
    expect(sub(1, 1)).toBe(0);
  });
});
`;

const failingTests = `describe('Failing describe', () => {
  test('Failing test', () => {
    expect(true).toBe(false);
  });
});
`;

export default function Playground() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full justify-center">
      <div className="">
        <SandpackProvider
          className="h-full"
          theme={dracula}
          customSetup={{
            entry: "add.ts",
            dependencies: {
              "jest-extended": "*",
            },
          }}
          files={{
            "/add.test.ts": addTests,
            "/add.ts": "export const add = (a: number, b: number): number => a + b;",
            "/sub.ts": "export const sub = (a: number, b: number): number => a - b;",
            "/sub.test.ts": subTests,
            "/failing.test.ts": failingTests,
          }}
        >
          <SandpackLayout className="">
            <SandpackCodeEditor showLineNumbers style={{ height: "70vh" }} />
            <SandpackTests />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}
