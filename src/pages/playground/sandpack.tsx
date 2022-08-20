import React from "react";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  SandpackFileExplorer,
  Sandpack,
  SandpackStack,
  RunButton,
  useClasser,
  RunIcon,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";

// TODO: Maybe use an ADT to model the different statuses
type Test = {
  name: string;
  status: "added" | "running" | "pass" | "fail";
  errors: Array<string>;
  duration?: number;
};
type Describe = { name: string; tests: Array<Test> };
// TODO: potentially this should be a Map<FileName, { describes, tests }>
type File = { name: string; describes: Array<Describe>; tests: Array<Test> };

type Results = Array<File>;

const SandpackTests: React.FC = () => {
  const [state, setState] = React.useState<any>({ state: "LOADING" });
  const { sandpack, listen } = useSandpack();

  const [files, setFiles] = React.useState<Results>([]);
  const [currentFile, setCurrentFile] = React.useState("");
  const [currentBlock, setCurrentBlock] = React.useState("");

  const handler = React.useCallback(
    (message: any) => {
      console.log("Message", message);
      // console.log("Files", file);
      console.log("CurrentFile", currentFile);
      // console.log("CurrentBlock", currentBlock);

      if ((message.type = "action" && message.action === "clear-errors" && message.source === "jest")) {
        setCurrentFile(message.path);
      }

      if (message.type === "test") {
        if (message.event === "add_file") {
          // setFiles((old) => [...old, { name: message.path, describes: [], tests: [] }]);
        }

        // if (message.event === "describe_start") {
        //   setCurrentBlock(message.blockName);
        //   const block: Describe = { name: message.blockName, tests: [] };

        //   setFiles((old) =>
        //     old.reduce<Array<File>>((acc, f) => {
        //       if (f.name === currentFile) {
        //         return acc.concat({ ...f, describes: f.describes.concat(block) });
        //       } else {
        //         return acc.concat(f);
        //       }
        //     }, [])
        //   );
        //   // TODO: set block on current file
        // }
      }
    },
    [currentFile]
  );

  React.useEffect(() => {
    listen((message: any) => {
      handler(message);
      /*
      // TODO: Handle show error messages from jest
        action: "show-error"
        codesandbox: true
        column: null
        columnEnd: undefined
        line: null
        lineEnd: undefined
        message: "Exceeded timeout of 5000ms for a test.\nUse jest.setTimeout(newTimeout) to increase the timeout value, if this is a long-running test."
        path: "/src/app/add.test.ts"
        payload: {}
        severity: "error"
        source: "jest"
        title: "Error"
        type: "action"
      */
      // if ((message.type = "action" && message.action === "clear-errors" && message.source === "jest")) {
      //   setCurrentFile(message.path);
      // }

      if (message.type === "test") {
        //   if (message.event === "add_file") {
        //     setFiles((old) => [...old, { name: message.path, describes: [], tests: [] }]);
        //   }

        // if (message.event === "describe_start") {
        //   setCurrentBlock(message.blockName);
        //   const block: Describe = { name: message.blockName, tests: [] };

        // setFiles((old) =>
        //   old.reduce<Array<File>>((acc, f) => {
        //     if (f.name === currentFile) {
        //       return acc.concat({ ...f, describes: f.describes.concat(block) });
        //     } else {
        //       return acc.concat(f);
        //     }
        //   }, [])
        // );
        // TODO: set block on current file
        // }

        // if (message.event === "add_test") {
        //   const file = files.find((f) => f.name === currentFile)!;

        //   // TODO: The test might actually not be in a block and goes straight on the file
        //   const block = file.describes.find((b) => b.name === currentBlock)!;

        //   const test: Test = {
        //     name: message.testName,
        //     status: "added",
        //     errors: [],
        //   };

        //   const newBlock: Describe = { ...block, tests: block.tests.concat(test) };
        //   // TODO: This would be easier if describes was a map of name -> test | describe
        //   // Replace the existing block with the updated version instead of concating!
        //   const newFile: File = { ...file, describes: file.describes.concat(newBlock), tests: [] };

        //   // Replace the existing file with the updated version instead of concating!
        //   setFiles((old) => old.concat(newFile));
        // }

        // TODO: Hande file error events
        // error: {name: 'TypeError', message: 'test.skixp is not a function', stack: 'TypeError: test.skixp is not a function\n    at eva…sandbox~sandbox-startup.c2408ad6a.chunk.js:1:407)', matcherResult: false, mappedErrors: Array(23)}
        // event: "file_error"
        // path: "/src/app/add.test.ts"
        // type: "test"

        if (message.event === "test_skip") {
          console.log("*".repeat(50));
        }
        // Jest-circus event types https://github.com/facebook/jest/blob/main/packages/jest-circus/src/eventHandler.ts
        // TODO: add_test message needs to include a mode field for skip/only/todo
        if (message.event === "add_test") {
          setState((prev: any) => ({
            ...prev,
            state: "RESULTS",
            results: [...(prev.results ?? []), { testName: message.testName, state: "added" }],
          }));

          return;
        }

        if (message.event === "total_test_start") {
          setState({ state: "LOADING" });

          return;
        }

        // TODOD: Handle: 'clear-errors' event. It seems this runs before `describe_start` and contains the describes file name

        // TODO: Handle: "total_test_end". If by this event a test is in `added` state then it was skipped

        if (message.event === "test_start" || message.event === "test_end") {
          setState((prev: any) => ({
            ...prev,
            results: prev.results.map((item: any) =>
              item.testName === message.test.name ? { ...item, state: message.test.status } : item
            ),
          }));

          return;
        }
      }
    });
  }, [currentFile]);

  const runAllTests = () => {
    setState({ state: "IDLE", results: [] });

    Object.values(sandpack.clients).forEach((client) => {
      // TODO: Support running individual test files with `run-tests` message
      // https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/sandbox/eval/tests/jest-lite.ts
      client.dispatch({
        type: "run-all-tests",
      } as any);
    });
  };

  return (
    <SandpackStack>
      <div className="flex border-b border-solid border-[#44475a] min-h-[40px] px-4 py-2 justify-between">
        <button className="flex items-center bg-gray-700 text-gray-50 pl-1 pr-3 rounded-lg" onClick={runAllTests}>
          <RunIcon />
          Run
        </button>
        {state.state === "LOADING" && (
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
      {state.state === "LOADING" && "Running tests..."}
      {state.state === "RESULTS" &&
        state.results.map((result: any) => {
          const { testName, state } = result;

          return (
            <div>
              {testName} : {state}
            </div>
          );
        })}
    </SandpackStack>
  );
};

const addTests = `
import * as matchers from 'jest-extended';
import {add} from './add';

expect.extend(matchers);

describe('add', () => {
  test('Commutative Law of Addition', () => {
    expect(add(1, 2)).toBe(add(2, 1));
  });

  test('adding two integers returns an integer', () => {
    expect(add(1, 100)).toBeInteger();
  });

  test('positive numbers remain positive', () => {
    expect(add(1, 1)).toBePositive();
  });

  test('negative numbers remain negative', () => {
    expect(add(-1, -1)).toBeNegative();
  });

  test('adding two even numbers does not give an odd number', () => {
    expect(add(1, 3)).not.toBeOdd();
  });

  test('adding two odd numbers gives an even number', () => {
    expect(add(1, 3)).toBeEven();
  });
});
`;

const subTests = `
import * as matchers from 'jest-extended';
import {sub} from './sub';

expect.extend(matchers);

describe('sub', () => {
  test('subtracting two and one gives one', () => {
    expect(sub(2, 1)).toBe(1);
  });
});
`;

// TODO: It looks like only is applying across all test files and should be scoped to it's file and/or describe
const onlyTests = `
describe('only', () => {
  test.only('only i should run', () => {
    expect(true).toBe(true)
  });

  test('i should not run', () => {
    expect(true).toBe(false)
  });
});
`;

const skipTests = `
test('i should run because im not skipped', () => {
  expect(true).toBe(true)
});

test.skip('i should not run as im skipped', () => {
  expect(true).toBe(false)
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
          entry: "src/app/add.test.ts",
          dependencies: {
            "jest-extended": "*",
          },
        }}
        files={{
          "/src/app/only.test.ts": onlyTests,
          "/src/app/skip.test.ts": skipTests,
          "/src/app/add.test.ts": addTests,
          "/src/app/sub.test.ts": subTests,
          "/src/app/add.ts": "export const add = (a: number, b: number): number => a + b;",
          "/src/app/sub.ts": "export const sub = (a: number, b: number): number => a - b;",
        }}
      >
        <SandpackLayout>
          <div className="hidden">
            <SandpackPreview />
          </div>
          <SandpackCodeEditor showLineNumbers />
          <SandpackTests />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
