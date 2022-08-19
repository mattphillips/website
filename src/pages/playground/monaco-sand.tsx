import React from "react";
import Editor from "@monaco-editor/react";
import { getDts } from "src/dts";
import path from "path";
import e from "expect";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  SandpackFileExplorer,
  Sandpack,
  useActiveCode,
} from "@codesandbox/sandpack-react";
// TODO: I think this might all be possible with the latest version of jest and some fs webpack magic
// TODO: I also think you can track the internal jest-circus state on the outside using it's dispatch etc so then it doesn't need reseting

// @ts-ignore
import * as matchers from "jest-extended";
// @ts-ignore
import { ROOT_DESCRIBE_BLOCK_NAME } from "jest-circus/build/state";

import * as ts from "typescript";

// @ts-ignore
import * as circus from "jest-circus";
// @ts-ignore
import runTest from "jest-circus/build/run";
import classNames from "classnames";

export const getServerSideProps = async () => {
  const nm = path.join(__dirname, "../../../..", "node_modules");
  const packages = await getDts({ nodeModulesPath: nm, packages: ["@types/jest", "jest-extended", "react"] });

  return { props: { packages: packages } };
};

// TODO: This could be useful for extracting external package type defs to be made available in editor
// TODO: https://github.com/lukasbach/monaco-editor-auto-typings/ this could save having to manually build the type defs
export default function Playground(props: any) {
  const testingFile = `
import * as matchers from 'jest-extended';
import {add} from './add';

expect.extend(matchers);

describe('add', () => {
  test('Commutative Law of Addition', () => {
    expect(add(1, 2)).toBe(add(2, 1));
    expect(1).toBeNumber();
  });
});
`;

  return (
    <SandpackProvider
      customSetup={{
        dependencies: {
          "jest-extended": "*",
        },
      }}
      template="react-ts"
      files={{
        "/src/app/add.test.ts": testingFile,
        "/src/app/add.ts": "export const add = (a: number, b: number): number => a + b;",
      }}
    >
      <Blah {...props} />
    </SandpackProvider>
  );
}
function Blah(props: any) {
  const [results, setResults] = React.useState([]);

  const { code: value, updateCode: setValue } = useActiveCode();

  const run = async () => {
    try {
      const expect = e;
      expect.extend(matchers);
      const test = circus.test;
      const it = circus.it;
      const describe = circus.describe;

      let code = ts
        .transpileModule(value, { compilerOptions: { module: ts.ModuleKind.ESNext } })
        .outputText.replace("export {};", "");
      console.log(code);

      eval(code);
      const result = await runTest();
      setResults(result);
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  let totalDuration = 0;
  let passed = 0;
  let failed = 0;
  const testsResultsHTML = results.map(({ duration, status, errors, testPath }) => {
    if (status === "fail") {
      failed += 1;
    } else {
      passed += 1;
    }
    const testResultHTML = <Result status={status} testPath={testPath} errors={errors} />;
    totalDuration += duration;
    return testResultHTML;
  });

  return (
    <div className="lg:mx-auto flex flex-col h-full justify-center p-12">
      <div className="flex flex-col lg:flex-row h-full lg:h-[90vh]">
        <div className="w-full lg:w-1/2">
          <Editor
            defaultLanguage="typescript"
            defaultValue={value}
            path="test.tsx"
            theme="vs-dark"
            onChange={(value) => setValue(value || "")}
            options={{ minimap: { enabled: false }, fontSize: 16 }}
            beforeMount={(m) => {
              m.languages.typescript.typescriptDefaults.setCompilerOptions({
                moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs,
                jsx: m.languages.typescript.JsxEmit.React,
              });

              m.languages.typescript.typescriptDefaults.addExtraLib(
                "export declare function add(a: number, b: number): number",
                "file:///node_modules/@types/math/index.d.ts"
              );

              for (const key of Object.keys(props.packages)) {
                m.languages.typescript.typescriptDefaults.addExtraLib(`${props.packages[key]}`, `file:///${key}`);
              }
            }}
          />
        </div>

        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers />
          <div className="hidden">
            <SandpackPreview />
          </div>
        </SandpackLayout>
      </div>
    </div>
  );
}

function Result({ status, testPath, errors }: { status: string; testPath: string[]; errors: string[] }) {
  const statusIcon = status === "fail" ? "×" : "✓";
  let errorsWrapperHTML = null;

  if (errors.length > 0) {
    const errorsHTML = errors
      .map((error) => escapeHTML(error))
      .join()
      .replaceAll(/^    at.*\n/gm, "")
      .replaceAll(/^    at.*/gm, "");
    // .split(/^    at/)
    // .reduce((acc, next) => (next.startsWith("    at") ? acc : acc.concat(`\n${next}`)), "");
    errorsWrapperHTML = <div className="pl-[1.5em] whitespace-pre text-red-500 mt-[1em]">{errorsHTML}</div>;
  }

  return (
    <div className="mb-[1em]">
      <span className="w-[1em] inline-block">{statusIcon}</span>
      <span
        className={classNames("inline-block px-[0.4em] py-[0.2em] mr-2", {
          "bg-red-500": status === "fail",
          "bg-[#333]": status === "pass",
        })}
      >
        {status.toUpperCase()}
      </span>
      {cleanTestPath(testPath).join(" › ")}

      {errorsWrapperHTML}
    </div>
  );
}

function cleanTestPath(path: string[]) {
  return path.filter((part) => part !== ROOT_DESCRIBE_BLOCK_NAME).map((part) => escapeHTML(part));
}
function escapeHTML(html: string) {
  return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Summary = ({
  status,
  failed,
  passed,
  timeInMilliseconds,
}: {
  status: string;
  failed: number;
  passed: number;
  timeInMilliseconds: number;
}) => {
  return (
    <span className={classNames({ "text-red-500": status === "fail", "text-green-500": status === "pass" })}>
      Tests: {failed} failed, {passed} passed, {passed + failed} total
      <br />
      Time: {timeInMilliseconds / 1000}s
    </span>
  );
};
