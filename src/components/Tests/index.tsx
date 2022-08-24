import React from "react";
import { SandpackStack } from "@codesandbox/sandpack-react";
import classNames from "classnames";
import immer from "immer";
import { set } from "lodash";
import { SandpackMessage } from "@codesandbox/sandpack-client";
import { useSandpackClient } from "./useSandpackClient";
import { SandboxTestMessage, Test } from "./Message";
import { Describe } from "./Describes";
import { Spec, Specs } from "./Specs";
import { Summary } from "./Summary";
import { RunButton } from "./RunButton";
import { Spinner } from "./Spinner";

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

export type Status = "initialising" | "idle" | "running" | "complete";
type RunMode = "all" | "single";

type State = {
  specs: { [path: string]: Spec };
  status: Status;
  runMode: RunMode;
  verbose: boolean;
};

const INITIAL_STATE: State = {
  specs: {},
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
  let currentSpec: string = "";

  React.useEffect(() => {
    const unsubscribe = listen((data: SandpackMessage | SandboxTestMessage): void => {
      // Note: short-circuit if message isn't for the currently active spec when `runMode` is `single`
      if (
        state.runMode === "single" &&
        (("path" in data && data.path !== sandpack.activeFile) ||
          ("test" in data && "path" in data.test && data.test.path !== sandpack.activeFile))
      ) {
        return;
      }

      if (data.type === "action" && data.action === "clear-errors" && data.source === "jest") {
        currentSpec = data.path;
        return;
      }

      if (data.type === "test") {
        if (data.event === "initialize_tests") {
          currentDescribeBlocks = [];
          currentSpec = "";
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
              state.specs[data.path] = {
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
              if (state.specs[data.path]) {
                delete state.specs[data.path];
              }
            })
          );
        }

        if (data.event === "file_error") {
          return setState((oldState) =>
            immer(oldState, (state) => {
              if (state.specs[data.path]) {
                state.specs[data.path].error = data.error;
              }
            })
          );
        }

        if (data.event === "describe_start") {
          currentDescribeBlocks.push(data.blockName);
          const head = currentDescribeBlocks.slice(0, currentDescribeBlocks.length - 1);
          const tail = currentDescribeBlocks[currentDescribeBlocks.length - 1];
          const spec = currentSpec;

          return setState((oldState) =>
            immer(oldState, (state) => {
              set(state.specs[spec], ["describes", ...head.flatMap((name) => [name, "describes"]), tail], {
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
          // TODO: This pattern is common
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
                state.specs[data.path].tests[data.testName] = test;
              } else {
                set(
                  state.specs[data.path].describes,
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
                state.specs[test.path].tests[test.name] = startedTest;
              } else {
                set(
                  state.specs[test.path].describes,
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
                state.specs[test.path].tests[test.name] = endedTest;
              } else {
                set(
                  state.specs[test.path].describes,
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
    setState((s) => ({ ...s, running: true, runMode: "all", specs: {} }));
    // TODO: Abstract this away
    const client = getClient();
    if (client) {
      client.dispatch({ type: "run-all-tests" } as any);
    }
  };

  const runTest = () => {
    setState((old) => ({ ...old, running: true, runMode: "single", specs: {} }));
    const client = getClient();
    if (client) {
      // TODO: Add this message type to the client
      client.dispatch({
        type: "run-tests",
        path: sandpack.activeFile,
      } as any);
    }
  };

  const openFile = (file: string) => {
    sandpack.setActiveFile(file);
  };

  const specs = Object.values(state.specs);

  const duration = specs.flatMap(getTests).reduce((acc, test) => acc + (test.duration || 0), 0);

  const allTests = specs.map(getStats).reduce(
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

  const allSuites = specs
    .filter((spec) => Object.values(spec.describes).length > 0 || Object.values(spec.tests).length > 0)
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

  const isSpecOpen = sandpack.activeFile.match(/\.(test|spec)\.(ts|js)$/);

  return (
    <SandpackStack style={{ height: "40vh" }}>
      <iframe ref={iframe} className="hidden" />
      <div className="flex border-b border-solid border-[#44475a] min-h-[40px] px-4 py-2 justify-between items-center">
        <div className="flex flex-row items-center">
          {state.status !== "initialising" && (
            <div className="mr-4">
              <RunButton onClick={runAllTests}>Run all</RunButton>
            </div>
          )}
          {state.status !== "initialising" && isSpecOpen && <RunButton onClick={runTest}>Run suite</RunButton>}
        </div>
        {(state.status === "running" || state.status === "initialising") && <Spinner />}
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
            <span className="ml-2 text-white ">Verbose</span>
          </label>
        )}
      </div>
      <div className="p-4 overflow-auto h-full flex flex-col font-[Consolas,_Monaco,_monospace]">
        <Specs specs={specs} verbose={state.verbose} status={state.status} open={openFile} />

        {state.status === "complete" && allTests.total > 0 && (
          <Summary suites={allSuites} tests={allTests} duration={duration} />
        )}
      </div>
    </SandpackStack>
  );
};

const getTests = (block: Describe | Spec): Array<Test> => {
  const tests = Object.values(block.tests);
  return tests.concat(...Object.values(block.describes).map(getTests));
};

const getStats = (spec: Spec) => {
  const allTests = getTests(spec);

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
