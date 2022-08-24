import React from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  useSandpack,
  SandpackStack,
  RunIcon,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import classNames from "classnames";
import immer from "immer";
// @ts-ignore
import ansiHTML from "ansi-html";
import { set, get } from "lodash";
import { Layout } from "src/components/Layout";
import { SandpackClient, ListenerFunction, SandpackMessage } from "@codesandbox/sandpack-client";

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
      .replace(/(Expected:)(.*)/m, `<span>$1</span><span style="color:green">$2</span>`)
      .replace(/(Received:)(.*)/m, `<span>$1</span><span style="color:red">$2</span>`)
      .replace(/^(-.*)/gm, `<span style="color:red">$1</span>`)
      .replace(/^(\+.*)/gm, `<span style="color:green">$1</span>`)}</span>`;
  } else {
    finalMessage = escapeHtml(error.message);
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

        const toBeIndex = code.content.indexOf(".to");
        const toBeMargin = Array.from({ length: margin.length + toBeIndex - (widestNumber - 1) }, () => " ");

        const content = escapeHtml(code.content)
          .replace(
            /(describe|test|it)(\()(&#039;|&quot;|`)(.*)(&#039;|&quot;|`)/m,
            `<span>$1$2$3</span><span style="color:rgba(0, 255, 255, 0.5)">$4</span><span>$5</span>`
          )
          .replace(
            /(expect\()(.*)(\)\..*)(to.*)(\()(.*)(\))/m,
            `<span>$1</span><span style="color:red">$2</span><span>$3</span><span style="text-decoration: underline; color: white">$4</span><span>$5</span><span style="color:green">$6</span><span>$7</span>`
          );

        finalMessage +=
          `<div ${code.highlight ? `style="font-weight:900; color: rgba(255, 255, 255, 0.5)"` : ``}>` +
          (code.highlight ? `<span style="color:red;">></span> ` : "") +
          newMargin.join("") +
          escapeHtml("" + code.lineNumber) +
          " | " +
          content +
          "</div>" +
          (code.highlight
            ? "<div>" + margin.join("") + " | " + toBeMargin.join("") + '<span style="color:red">^</span>' + "</div>"
            : "");
      });
    finalMessage += "</div>";
  }

  return finalMessage.replace(/(?:\r\n|\r|\n)/g, "<br />");
};

export type TestStatus = "idle" | "running" | "pass" | "fail";

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
  status: TestStatus;
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
  name: string;
  error?: TestError;
  tests: {
    [testName: string]: Test;
  };
  describes: {
    [describeName: string]: Describe;
  };
};

type Status = "initialising" | "idle" | "running" | "complete";
type RunMode = "all" | "single";

type State = {
  files: { [path: string]: File };
  status: Status;
  runMode: RunMode;
  verbose: boolean;
};

const INITIAL_STATE: State = {
  files: {},
  status: "initialising",
  runMode: "all",
  verbose: false,
};

const useSandpackClient = () => {
  const { sandpack, listen, dispatch } = useSandpack();
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const clientId = React.useRef<string>(generateRandomId());

  React.useEffect(() => {
    const iframeElement = iframeRef.current!;
    const clientIdValue = clientId.current;

    sandpack.registerBundler(iframeElement, clientIdValue);

    return () => sandpack.unregisterBundler(clientId.current);
  }, []);

  const getClient = (): SandpackClient | null => {
    return sandpack.clients[clientId.current] || null;
  };

  return {
    sandpack,
    getClient,
    iframe: iframeRef,
    listen: (listener: ListenerFunction) => listen(listener, clientId.current),
    dispatch: (message: SandpackMessage) => dispatch(message, clientId.current),
  };
};

// Sandbox wrapper of jest-cirucs: https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/sandbox/eval/tests/jest-lite.ts
// This is the sandbox component impl: https://github.com/codesandbox/codesandbox-client/blob/389073613e06eee944231f4aeef9dfa746c1b947/packages/app/src/app/components/Preview/DevTools/Tests/index.tsx
// All message types for tests: https://github.com/codesandbox/codesandbox-client/blob/master/packages/common/src/utils/jest-lite.ts
const SandpackTests: React.FC<{ verbose?: boolean }> = ({ verbose = false }) => {
  const { getClient, iframe, listen, sandpack } = useSandpackClient();

  const [state, setState] = React.useState<State>({ ...INITIAL_STATE, verbose });

  let currentDescribeBlocks: Array<string> = [];
  let currentFile: string = "";

  React.useEffect(() => {
    // TODO: You've not handle the external status updates in the live impl
    const unsubscribe = listen((data: any) => {
      // console.log("Message", data);
      if (data.type === "action" && data.action === "clear-errors" && data.source === "jest") {
        currentFile = data.path;
      }

      if (data.type === "test") {
        if (data.event === "initialize_tests") {
          currentDescribeBlocks = [];
          currentFile = "";
          return setState((old) => ({ ...INITIAL_STATE, status: "idle", runMode: old.runMode }));
        }

        if (data.event === "test_count") {
          return;
        }

        if (data.event === "total_test_start") {
          currentDescribeBlocks = [];
          return setState((old) => ({ ...old, status: "running" }));
        }

        if (data.event === "total_test_end") {
          return setState((old) => ({ ...old, status: "complete", runMode: "all" }));
        }

        if (data.event === "add_file") {
          if (state.runMode === "single" && data.path !== sandpack.activeFile) {
            return;
          }
          return setState((oldState) =>
            immer(oldState, (state) => {
              state.files[data.path] = {
                describes: {},
                tests: {},
                name: data.path,
              };
            })
          );
        }

        if (data.event === "remove_file") {
          if (state.runMode === "single" && data.path !== sandpack.activeFile) {
            return;
          }
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (state.files[data.path]) {
                delete state.files[data.path];
              }
            })
          );
        }

        if (data.event === "file_error") {
          if (state.runMode === "single" && data.path !== sandpack.activeFile) {
            return;
          }
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (state.files[data.path]) {
                state.files[data.path].error = data.error;
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
          if (state.runMode === "single" && data.path !== sandpack.activeFile) {
            return;
          }
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
                  }
                );
              }
            })
          );
        }

        if (data.event === "test_start") {
          if (state.runMode === "single" && data.test.path !== sandpack.activeFile) {
            return;
          }
          const { test } = data;
          const head = test.blocks.slice(0, test.blocks.length - 1);
          const tail = test.blocks[test.blocks.length - 1];

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[test.path].tests[test.name] = {
                  status: "running",
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
          if (state.runMode === "single" && data.test.path !== sandpack.activeFile) {
            return;
          }
          const { test } = data;
          const head = test.blocks.slice(0, test.blocks.length - 1);
          const tail = test.blocks[test.blocks.length - 1];

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[test.path].tests[test.name] = {
                  status: test.status,
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

    return unsubscribe;
  }, [state.runMode, sandpack.activeFile]);

  const runAllTests = () => {
    setState((s) => ({ ...s, running: true, runMode: "all", files: {} }));
    // TODO: Abstract this away
    const client = getClient();
    if (client) {
      client.dispatch({ type: "run-all-tests" } as any);
    }
  };

  const runTest = () => {
    setState((old) => ({ ...old, running: true, runMode: "single", files: {} }));
    const client = getClient();
    if (client) {
      client.dispatch({
        type: "run-tests",
        path: sandpack.activeFile,
      } as any);
    }
  };

  const openFile = (file: string) => {
    sandpack.setActiveFile(file);
  };

  // console.log("State", state);

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
  const allSuites = Object.values(state.files)
    .filter((file) => Object.values(file.describes).length > 0 || Object.values(file.tests).length > 0)
    .map(getStats)
    .reduce(
      (acc, stats) => {
        return {
          pass: acc.pass + (stats.fail === 0 ? 1 : 0),
          fail: acc.fail + (stats.fail > 0 ? 1 : 0),
          total: acc.total + 1,
        };
      },
      { pass: 0, fail: 0, total: 0 }
    );

  const isTestFileOpen = sandpack.activeFile.match(/\.(test|spec)\.(ts|js)$/);

  return (
    <SandpackStack style={{ height: "40vh" }}>
      <iframe ref={iframe} className="hidden" />
      <div className="flex border-b border-solid border-[#44475a] min-h-[40px] px-4 py-2 justify-between items-center">
        {state.status !== "initialising" && (
          <button className="flex items-center bg-gray-700 text-gray-50 pl-1 pr-3 rounded-lg" onClick={runAllTests}>
            <RunIcon />
            Run all
          </button>
        )}
        {state.status !== "initialising" && (
          <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              checked={state.verbose}
              id="default-toggle"
              className="sr-only peer"
              onChange={() => setState((s) => ({ ...s, verbose: !s.verbose }))}
            />
            <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
            <span className="ml-2  text-white ">Verbose</span>
          </label>
        )}

        <div className="flex flex-row">
          {state.status !== "initialising" && isTestFileOpen && (
            <button className="flex items-center bg-gray-700 text-gray-50 pl-1 pr-3 rounded-lg" onClick={runTest}>
              <RunIcon />
              Run suite
            </button>
          )}
          {(state.status === "running" || state.status === "initialising") && (
            <div role="status" className={classNames({ "ml-4": state.status === "running" })}>
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
      </div>
      <div className="p-4 overflow-auto h-full flex flex-col font-[Consolas,_Monaco,_monospace]">
        {/* TODO: Rename files to suites */}
        {Object.values(state.files).map((file) => {
          if (file.error) {
            return (
              <div className="mb-2">
                <span className="px-2 py-1 bg-red-500 mr-2 font-[Consolas,_Monaco,_monospace]">ERROR</span>
                <button className="mb-2 decoration-dotted underline text-white" onClick={() => openFile(file.name)}>
                  {file.name}
                </button>
                <div
                  className="mb-2 p-4 text-sm leading-[1.6] whitespace-pre-wrap text-white"
                  dangerouslySetInnerHTML={{ __html: formatDiffMessage(file.error, file.name) }}
                ></div>
              </div>
            );
          }

          if (Object.values(file.describes).length === 0 && Object.values(file.tests).length === 0) {
            return null;
          }

          /* TODO: Don't recompute this here */
          const stats = getStats(file);

          return (
            <div className="mb-2">
              {state.status === "complete" &&
                (stats.fail > 0 ? (
                  <span className="px-2 py-1 bg-red-500 mr-2 font-[Consolas,_Monaco,_monospace]">FAIL</span>
                ) : (
                  <span className="px-2 py-1 bg-green-500 mr-2 font-[Consolas,_Monaco,_monospace]">PASS</span>
                ))}
              <button className="mb-2 decoration-dotted underline text-white" onClick={() => openFile(file.name)}>
                {file.name}
              </button>

              {state.verbose && Object.values(file.tests).map((test) => <Test test={test} />)}

              {state.verbose &&
                Object.values(file.describes).map((describe) => (
                  <Describe describe={describe} verbose={state.verbose} />
                ))}

              {getFailingTests(file).map((test) => {
                return (
                  <div key={`failing-${test.name}`}>
                    <div className="text-red-500 mt-2">
                      ● {test.blocks.join(" › ")} › {test.name}
                    </div>
                    {test.errors.map((e) => {
                      return (
                        <div
                          className="p-4 text-sm leading-[1.6] whitespace-pre-wrap text-white"
                          dangerouslySetInnerHTML={{ __html: formatDiffMessage(e, test.path) }}
                        ></div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
        {state.status === "complete" && allTests.total > 0 && (
          <div className="text-gray-400">
            <div className="mb-2">
              <span className="font-bold text-white">Tests Suites: </span>
              {allSuites.fail > 0 && <span className="text-red-500">{allSuites.fail} failed, </span>}
              {allSuites.pass > 0 && <span className="text-green-500">{allSuites.pass} passed, </span>}
              <span>{allSuites.total} total</span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-white whitespace-pre">Tests:{"        "}</span>
              {allTests.fail > 0 && <span className="text-red-500">{allTests.fail} failed, </span>}
              {allTests.skip > 0 && <span className="text-yellow-500">{allTests.skip} skipped, </span>}
              {allTests.pass > 0 && <span className="text-green-500">{allTests.pass} passed, </span>}
              <span>{allTests.total} total</span>
            </div>
            <div className="font-bold text-white whitespace-pre">
              Time:{"         "}
              {duration / 1000}s
            </div>
          </div>
        )}
      </div>
    </SandpackStack>
  );
};

const getFailingTests = (block: Describe | File): Array<Test> => {
  return getTests(block).filter((t) => t.status === "fail");
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

const Describe: React.FC<{ describe: Describe; verbose: boolean }> = ({ describe, verbose }) => {
  if (Object.values(describe.describes).length === 0 && Object.values(describe.tests).length === 0) {
    return null;
  }

  return (
    <div className="ml-4">
      <div className="">
        <div className={classNames("mb-2 text-white", {})}>{describe.name}</div>

        {verbose && Object.values(describe.tests).map((test) => <Test test={test} />)}

        {Object.values(describe.describes).map((d) => (
          <Describe describe={d} verbose={verbose} />
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
    <Layout>
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
              <SandpackCodeEditor showLineNumbers style={{ height: "40vh" }} />
              <SandpackTests />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </Layout>
  );
}
