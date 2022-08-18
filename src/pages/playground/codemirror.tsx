import React from "react";

// import { Sandpack } from "@codesandbox/sandpack-react";

import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";

const CustomSandpack = () => (
  <SandpackProvider template="react">
    <SandpackLayout>
      <SandpackCodeEditor showLineNumbers />
      <SandpackPreview />
    </SandpackLayout>
  </SandpackProvider>
);

export default function Playground() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full justify-center">
      <CustomSandpack />
    </div>
  );
}
