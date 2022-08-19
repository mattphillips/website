import React from "react";
import { SandpackClient } from "@codesandbox/sandpack-client";

import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";

const SimpleCodeViewer = () => {
  const [state, setState] = React.useState<any>({ state: "IDLE" });
  const { sandpack, listen, dispatch } = useSandpack();
  const { files, activeFile } = sandpack;

  React.useEffect(() => {
    sandpack.registerBundler;
  }, []);

  const runAllTests = () => {
    console.log("asdf");
    setState({ state: "IDLE", results: [] });
    console.log(sandpack.clients);
  };
  const code = files[activeFile].code;
  return (
    <div>
      <pre className="text-white">{code}</pre>
      <button onClick={runAllTests}>Run</button>
    </div>
  );
};

export default function Sand() {
  return (
    <SandpackProvider template="react">
      <SandpackLayout>
        <SandpackFileExplorer />
        <SandpackCodeEditor />
        {/* This will render the pre on the right side of your sandpack component */}
        <SimpleCodeViewer />
      </SandpackLayout>
    </SandpackProvider>
  );
}
