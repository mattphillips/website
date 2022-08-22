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
  testName: string[];
  status: Status;
  running: boolean;
  path: string;
  errors: TestError[];
  duration?: number | undefined;
};

export type File = {
  fileName: string;
  fileError?: TestError;
  tests: {
    [testName: string]: Test;
  };
};

type State = {
  selectedFilePath: string | null;
  files: {
    [path: string]: File;
  };
  running: boolean;
  watching: boolean;
};

const INITIAL_STATE: State = {
  files: {},
  selectedFilePath: null,
  running: false,
  watching: false,
};

// Sandbox wrapper of jest-cirucs: https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/sandbox/eval/tests/jest-lite.ts
// This is the sandbox component impl: https://github.com/codesandbox/codesandbox-client/blob/389073613e06eee944231f4aeef9dfa746c1b947/packages/app/src/app/components/Preview/DevTools/Tests/index.tsx
// All message types for tests: https://github.com/codesandbox/codesandbox-client/blob/master/packages/common/src/utils/jest-lite.ts
const SandpackTests: React.FC<{}> = ({}) => {
  const { sandpack, listen } = useSandpack();
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const clientId = React.useRef<string>(generateRandomId());
  const [state, setState] = React.useState<State>(INITIAL_STATE);
  const { theme } = useSandpackTheme();

  let draftState: State | null = null;
  let currentDescribeBlocks: Array<string> = [];

  React.useEffect(() => {
    const iframeElement = iframeRef.current!;
    const clientIdValue = clientId.current;

    sandpack.registerBundler(iframeElement, clientIdValue);

    // TODO: You've not handle the external status updates in the live impl
    const unsubscribe = listen((data: any) => {
      console.log("Message", data);
      if (data.type === "test") {
        if (data.event === "initialize_tests") {
          currentDescribeBlocks = [];
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
          return currentDescribeBlocks.push(data.blockName);
        }

        if (data.event === "describe_end") {
          return currentDescribeBlocks.pop();
        }

        if (data.event === "add_test") {
          const testName = [...currentDescribeBlocks, data.testName];
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (!state.files[data.path]) {
                state.files[data.path] = {
                  tests: {},
                  fileName: data.path,
                };
              }

              state.files[data.path].tests[testName.join("||||")] = {
                status: "idle",
                errors: [],
                testName,
                path: data.path,
                running: false,
              };
            })
          );
        }

        if (data.event === "test_start") {
          const { test } = data;
          const testName = [...test.blocks, test.name];

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (!state.files[test.path]) {
                state.files[test.path] = {
                  tests: {},
                  fileName: test.path,
                };
              }

              const currentTest = state.files[test.path].tests[testName.join("||||")];
              if (!currentTest) {
                state.files[test.path].tests[testName.join("||||")] = {
                  status: "running",
                  running: true,
                  testName,
                  path: test.path,
                  errors: [],
                };
              } else {
                currentTest.status = "running";
                currentTest.running = true;
              }
            })
          );
        }

        if (data.event === "test_end") {
          const { test } = data;
          const testName = [...test.blocks, test.name];

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (!state.files[test.path]) {
                return;
              }

              const existingTest = state.files[test.path].tests[testName.join("||||")];

              if (existingTest) {
                existingTest.status = test.status;
                existingTest.running = false;
                existingTest.errors = test.errors;
                existingTest.duration = test.duration;
              } else {
                state.files[test.path].tests[testName.join("||||")] = {
                  status: test.status,
                  running: false,
                  errors: test.errors,
                  duration: test.duration,
                  testName,
                  path: test.path,
                };
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

  return (
    <SandpackStack style={{ minHeight: "80vh" }}>
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
      <div className="p-4 overflow-auto">
        {Object.values(state.files).map((file) => (
          <div>
            <button onClick={() => openFile(file.fileName)}>{file.fileName}</button>
            {Object.values(file.tests).map((test) => (
              <div>
                <div
                  key={test.testName.join(" > ")}
                  className={classNames("mb-2", {
                    "text-gray-400": test.status === "idle",
                    "text-yellow-400": test.status === "running",
                    "text-red-400": test.status === "fail",
                    "text-green-400": test.status === "pass",
                  })}
                >
                  {test.testName.join(" > ")}
                </div>
                {test.errors.map((e) => {
                  return (
                    <div
                      className="font-[Menlo,_Source_Code_Pro,_monospace] p-4 text-sm leading-[1.6] whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatDiffMessage(e, test.path) }}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </SandpackStack>
  );
};

const addTests = `import * as matchers from 'jest-extended';
import {add} from './add';

expect.extend(matchers);

describe('add', () => {
  test.skip('Commutative Law of Addition', () => {
    expect(add(1, 2)).toBe(add(2, 1));
  });

  test('adding two integers returns an integer', () => {
    expect(add(1, 100)).toBeInteger();
  });

  test('positive numbers remain positive', () => {
    expect(add(-10, 1)).toBePositive();
  });

  test('negative numbers remain negative', async () => {
    // await new Promise(res => setTimeout(res, 3000));
    expect(add(-1, -1)).toBeNegative();
  });

  describe('nested add block', () => {
    test('adding two odd numbers gives an even number', () => {
      expect(add(1, 3)).toBeEven();
    });
  })
});

describe('sibling to add block', () => {
  test('adding two even numbers does not give an odd number', () => {
    expect(add(1, 3)).not.toBeOdd();
  });    
});
`;

const subTests = `import * as matchers from 'jest-extended';
import {sub} from './sub';

expect.extend(matchers);

describe('sub', () => {
  test('Should be positive', () => {
    expect(sub(1, 100)).toBePositive();
  });
});
`;

export default function Playground() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full justify-center">
      <SandpackProvider
        theme={dracula}
        customSetup={{
          entry: "add.ts",
          dependencies: {
            "jest-extended": "*",
          },
        }}
        files={{
          "/add.ts": "export const add = (a: number, b: number): number => a + b;",
          "/add.test.ts": addTests,
          "/sub.ts": "export const sub = (a: number, b: number): number => a + b;",
          "/sub.test.ts": subTests,
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers style={{ height: "100%" }} />
          <SandpackTests />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
