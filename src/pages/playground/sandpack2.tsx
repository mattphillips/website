import React from "react";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  SandpackStack,
  RunIcon,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import classNames from "classnames";
import { TaggedUnion } from "ts-prelude/TaggedUnion";

// TODO: Check todos in sandpack.tsx
type Test = {
  name: string;
  status: "added" | "running" | "pass" | "fail";
  errors: Array<string>;
  duration?: number;
};
type Describe = { name: string; tests: Array<Test> };
type File = { name: string; describes: Array<Describe>; tests: Array<Test> };
type Results = Array<File>;

const handler = (state: string, message: any): string => {
  if ((message.type = "action" && message.action === "clear-errors" && message.source === "jest")) {
    return message.path;
  }

  return state;
};

type State = TaggedUnion<{
  idle: {};
  running: { tests: Array<Test>; blocks: Map<string, Array<Test>> };
  complete: { tests: Array<Test> };
}>;
const State = TaggedUnion<State>(["complete", "idle", "running"]);

// Sandbox wrapper of jest-cirucs: https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/sandbox/eval/tests/jest-lite.ts

// This is the sandbox component impl:
// https://github.com/codesandbox/codesandbox-client/blob/389073613e06eee944231f4aeef9dfa746c1b947/packages/app/src/app/components/Preview/DevTools/Tests/index.tsx
const SandpackTests: React.FC<{ store: string; dispatch: React.Dispatch<any> }> = ({ dispatch, store }) => {
  const { sandpack, listen } = useSandpack();
  const [state, setState] = React.useState<State>(State.of.idle({}));

  React.useEffect(() => {
    let currentDescribe = "";
    // All message types for tests: https://github.com/codesandbox/codesandbox-client/blob/master/packages/common/src/utils/jest-lite.ts
    const unsub = listen((message: any) => {
      console.log("Message", message);
      if (message.type === "test") {
        if (message.event === "describe_start") {
          currentDescribe = message.blockName;
        }

        if (message.event === "add_test") {
          setState(
            State.match({
              running: ({ tests, blocks }) => {
                console.log("blocks", blocks);
                if (blocks.has(currentDescribe)) {
                  const ts = blocks.get(currentDescribe)!;
                  const newBlocks = new Map([
                    ...blocks.entries(),
                    [currentDescribe, ts?.concat({ errors: [], name: message.testName, status: "added" })],
                  ]);
                  return State.of.running({
                    blocks: newBlocks,
                    tests: tests.concat({ errors: [], name: message.testName, status: "added" }),
                  });
                } else {
                  const newBlocks = new Map([
                    ...blocks.entries(),
                    [currentDescribe, [{ errors: [], name: message.testName, status: "added" }]],
                  ]);

                  return State.of.running({
                    blocks: newBlocks,
                    tests: tests.concat({ errors: [], name: message.testName, status: "added" }),
                  });
                }
              },
              complete: (c) => State.of.complete(c),
              idle: () => State.of.idle({}),
            })
          );
        }

        if (message.event === "test_start") {
          setState(
            State.match({
              running: ({ tests, blocks }) =>
                State.of.running({
                  blocks,
                  tests: tests.reduce<Array<Test>>(
                    (acc, test) =>
                      test.name === message.test.name ? acc.concat({ ...test, status: "running" }) : acc.concat(test),
                    []
                  ),
                }),
              complete: (c) => State.of.complete(c),
              idle: () => State.of.idle({}),
            })
          );
        }

        if (message.event === "test_end") {
          setState(
            State.match({
              running: ({ tests, blocks }) =>
                State.of.running({
                  blocks,
                  tests: tests.reduce<Array<Test>>(
                    (acc, test) =>
                      test.name === message.test.name
                        ? acc.concat({ ...test, status: message.test.status })
                        : acc.concat(test),
                    []
                  ),
                }),
              complete: (c) => State.of.complete(c),
              idle: () => State.of.idle({}),
            })
          );
        }

        if (message.event === "total_test_end") {
          setState(
            State.match({
              running: (c) => State.of.complete(c),
              complete: (c) => State.of.complete(c),
              idle: () => State.of.complete({ tests: [] }),
            })
          );
        }
      }
    });
    return unsub;
  }, []);

  const runAllTests = () => {
    setState(State.of.running({ tests: [], blocks: new Map() }));
    Object.values(sandpack.clients).forEach((client) => {
      client.dispatch({ type: "run-all-tests" } as any);
    });
  };

  console.log(state);

  return (
    <SandpackStack>
      <div className="flex border-b border-solid border-[#44475a] min-h-[40px] px-4 py-2 justify-between">
        <button className="flex items-center bg-gray-700 text-gray-50 pl-1 pr-3 rounded-lg" onClick={runAllTests}>
          <RunIcon />
          Run
        </button>
        {State.is.running(state) && (
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
      <div className="p-4">
        {State.match({
          idle: () => null,
          running: ({ tests }) =>
            tests.map((test) => (
              <div
                key={test.name}
                className={classNames("mb-2", {
                  "text-gray-400": test.status === "added",
                  "text-yellow-400": test.status === "running",
                  "text-red-400": test.status === "fail",
                  "text-green-400": test.status === "pass",
                })}
              >
                {test.name}
              </div>
            )),
          // TODO: This needs to display the summary
          complete: ({ tests }) =>
            // TODO: This should be a component
            tests.map((test) => (
              <div
                key={test.name}
                className={classNames("mb-2", {
                  "text-gray-400": test.status === "added",
                  "text-yellow-400": test.status === "running",
                  "text-red-400": test.status === "fail",
                  "text-green-400": test.status === "pass",
                })}
              >
                {test.name}
              </div>
            )),
        })(state)}
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
    // await new Promise(res => setTimeout(res, 10000));
    expect(add(-1, -1)).toBeNegative();
  });

  test('adding two even numbers does not give an odd number', () => {
    expect(add(1, 3)).not.toBeOdd();
  });

  test('adding two odd numbers gives an even number', () => {
    expect(add(1, 3)).toBeEven();
  });
});

describe('sub', () => {
  test('fail', () => {
    expect(add(1, 100)).toBeInteger();
  });
});
`;

export default function Playground() {
  const [store, dispatch] = React.useReducer(handler, "");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full justify-center">
      <SandpackProvider
        theme={dracula}
        customSetup={{
          entry: "src/app/add.test.ts",
          dependencies: {
            "jest-extended": "*",
          },
        }}
        files={{
          "/src/app/add.test.ts": addTests,
          "/src/app/add.ts": "export const add = (a: number, b: number): number => a + b;",
        }}
      >
        <SandpackLayout>
          <div className="hidden">
            <SandpackPreview />
          </div>
          <SandpackCodeEditor showLineNumbers />
          <SandpackTests store={store} dispatch={dispatch} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
