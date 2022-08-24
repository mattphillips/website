import React from "react";
import { SandpackStack, RunIcon } from "@codesandbox/sandpack-react";
import classNames from "classnames";
import immer from "immer";
import { set } from "lodash";
import { SandpackMessage } from "@codesandbox/sandpack-client";
import { formatDiffMessage } from "./utils";
import { useSandpackClient } from "./useSandpackClient";
import { SandboxTestMessage, Test, TestError } from "./Message";
import { Tests } from "./Tests";

// TODO: Check todos in sandpack.tsx
/*
TODO:
- Pull out components (Test/Tests/Describes/Describe/Suites/Suite/TestSummary)
- Write some nicer combinators for working with the data structure to compute shit
- Add types to listen function (really this should be a PR to the API spec)
- Migrate to Sandpack theme
- PR error syntax highlighting PR to codesandbox
- Tidy controls 
*/

type Block = {
  name: string;
  tests: { [testName: string]: Test };
  describes: { [describeName: string]: Block };
};

type File = { error?: TestError } & Block;

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

// Sandbox wrapper of jest-cirucs: https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/sandbox/eval/tests/jest-lite.ts
// This is the sandbox component impl: https://github.com/codesandbox/codesandbox-client/blob/389073613e06eee944231f4aeef9dfa746c1b947/packages/app/src/app/components/Preview/DevTools/Tests/index.tsx
// All message types for tests: https://github.com/codesandbox/codesandbox-client/blob/master/packages/common/src/utils/jest-lite.ts
export const SandpackTests: React.FC<{ verbose?: boolean }> = ({ verbose = false }) => {
  const { getClient, iframe, listen, sandpack } = useSandpackClient();

  const [state, setState] = React.useState<State>({ ...INITIAL_STATE, verbose });

  let currentDescribeBlocks: Array<string> = [];
  let currentFile: string = "";

  React.useEffect(() => {
    const unsubscribe = listen((data: SandpackMessage | SandboxTestMessage): void => {
      // console.log("Message", data);

      // Note: short-circuit if message isn't for the currently active file when `runMode` is `single`
      if (
        state.runMode === "single" &&
        (("path" in data && data.path !== sandpack.activeFile) ||
          ("test" in data && "path" in data.test && data.test.path !== sandpack.activeFile))
      ) {
        return;
      }

      if (data.type === "action" && data.action === "clear-errors" && data.source === "jest") {
        currentFile = data.path;
        return;
      }

      if (data.type === "test") {
        if (data.event === "initialize_tests") {
          currentDescribeBlocks = [];
          currentFile = "";
          return setState((oldState) => ({ ...INITIAL_STATE, status: "idle", runMode: oldState.runMode }));
        }

        if (data.event === "test_count") {
          return;
        }

        if (data.event === "total_test_start") {
          currentDescribeBlocks = [];
          return setState((oldState) => ({ ...oldState, status: "running" }));
        }

        if (data.event === "total_test_end") {
          return setState((oldState) => ({ ...oldState, status: "complete", runMode: "all" }));
        }

        if (data.event === "add_file") {
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
          currentDescribeBlocks.pop();
          return;
        }

        if (data.event === "add_test") {
          const head = currentDescribeBlocks.slice(0, currentDescribeBlocks.length - 1);
          const tail = currentDescribeBlocks[currentDescribeBlocks.length - 1];
          const test: Test = {
            status: "idle",
            errors: [],
            name: data.testName,
            blocks: [...currentDescribeBlocks],
            path: data.path,
          };
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[data.path].tests[data.testName] = test;
              } else {
                set(
                  state.files[data.path].describes,
                  [...head.flatMap((name) => [name, "describes"]), tail, "tests", data.testName],
                  test
                );
              }
            })
          );
        }

        if (data.event === "test_start") {
          const { test } = data;
          const head = test.blocks.slice(0, test.blocks.length - 1);
          const tail = test.blocks[test.blocks.length - 1];

          const startedTest: Test = {
            status: "running",
            name: test.name,
            blocks: test.blocks,
            path: test.path,
            errors: [],
          };

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[test.path].tests[test.name] = startedTest;
              } else {
                set(
                  state.files[test.path].describes,
                  [...head.flatMap((name: string) => [name, "describes"]), tail, "tests", test.name],
                  startedTest
                );
              }
            })
          );
        }

        if (data.event === "test_end") {
          const { test } = data;
          const head = test.blocks.slice(0, test.blocks.length - 1);
          const tail = test.blocks[test.blocks.length - 1];

          const endedTest = {
            status: test.status,
            errors: test.errors,
            duration: test.duration,
            name: test.name,
            blocks: test.blocks,
            path: test.path,
          };

          return setState((oldState) =>
            immer(oldState, (state) => {
              if (tail === undefined) {
                state.files[test.path].tests[test.name] = endedTest;
              } else {
                set(
                  state.files[test.path].describes,
                  [...head.flatMap((name: string) => [name, "describes"]), tail, "tests", test.name],
                  endedTest
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
          const parts = file.name.split("/");
          const path = parts.slice(0, parts.length - 1).join("/") + "/";
          const name = parts[parts.length - 1];

          if (file.error) {
            return (
              <div className="mb-2">
                <span className="px-2 py-1 bg-[#f7362b] mr-2 font-[Consolas,_Monaco,_monospace]">ERROR</span>
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
          const tests = Object.values(file.tests);

          return (
            <div className="mb-2">
              {state.status === "complete" &&
                (stats.fail > 0 ? (
                  <span className="px-2 py-1 bg-[#f7362b] mr-2 font-[Consolas,_Monaco,_monospace]">FAIL</span>
                ) : (
                  <span className="px-2 py-1 bg-[#15c213] mr-2 font-[Consolas,_Monaco,_monospace]">PASS</span>
                ))}
              <button className="mb-2" onClick={() => openFile(file.name)}>
                <span className="text-gray-400 decoration-dotted underline">{path}</span>
                <span className="text-white decoration-dotted underline">{name}</span>
              </button>

              {verbose && <Tests tests={tests} />}

              {state.verbose &&
                Object.values(file.describes).map((describe) => (
                  <Describe describe={describe} verbose={state.verbose} />
                ))}

              {getFailingTests(file).map((test) => {
                return (
                  <div key={`failing-${test.name}`}>
                    <div className="text-[#fa7c75] mt-2 font-bold">
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
          <div className="text-gray-400 font-bold">
            <div className="mb-2">
              <span className="font-bold text-white">Tests Suites: </span>
              {allSuites.fail > 0 && <span className="text-[#fa7c75]">{allSuites.fail} failed, </span>}
              {allSuites.pass > 0 && <span className="text-[#15c213]">{allSuites.pass} passed, </span>}
              <span>{allSuites.total} total</span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-white whitespace-pre">Tests:{"        "}</span>
              {allTests.fail > 0 && <span className="text-[#fa7c75]">{allTests.fail} failed, </span>}
              {allTests.skip > 0 && <span className="text-[#c1ba35]">{allTests.skip} skipped, </span>}
              {allTests.pass > 0 && <span className="text-[#15c213]">{allTests.pass} passed, </span>}
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

const getFailingTests = (block: Block | File): Array<Test> => {
  return getTests(block).filter((t) => t.status === "fail");
};

const getTests = (block: Block | File): Array<Test> => {
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

const Describe: React.FC<{ describe: Block; verbose: boolean }> = ({ describe, verbose }) => {
  if (Object.values(describe.describes).length === 0 && Object.values(describe.tests).length === 0) {
    return null;
  }

  const tests = Object.values(describe.tests);

  return (
    <div className="ml-4">
      <div className="">
        <div className={classNames("mb-2 text-white", {})}>{describe.name}</div>

        {verbose && <Tests tests={tests} />}

        {Object.values(describe.describes).map((d) => (
          <Describe describe={d} verbose={verbose} />
        ))}
      </div>
    </div>
  );
};
