import React from "react";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import { Layout } from "src/components/Layout";
import { SandpackTests } from "src/components/Tests";

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
      // await new Promise(res => setTimeout(res, 2000));
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
              "/src/app/sub.ts": "export const sub = (a: number, b: number): number => a - b;",
              "/src/app/sub.test.ts": subTests,
              "/failing.test.ts": failingTests,
            }}
          >
            <SandpackLayout className="">
              <SandpackCodeEditor showRunButton={false} showLineNumbers style={{ height: "40vh" }} />
              <SandpackTests />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </Layout>
  );
}
