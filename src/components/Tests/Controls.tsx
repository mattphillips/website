import React from "react";
import { Status } from ".";
import { RunButton } from "./RunButton";
import { Toggle } from "./Toggle";

type Props = {
  runAllTests: () => void;
  runSpec: () => void;
  setVerbose: () => void;
  verbose: boolean;
  status: Status;
  isSpecOpen: boolean;
};

export const Controls: React.FC<Props> = ({ runAllTests, runSpec, status, setVerbose, verbose, isSpecOpen }) => {
  return (
    <div className="flex border-b border-solid border-[#44475a] h-[40px] px-4 py-2 justify-between items-center font-[Consolas,_Monaco,_monospace]">
      <div className="flex flex-row items-center">
        <div className="mr-4">
          <RunButton onClick={runAllTests} disabled={status === "initialising"}>
            Run all
          </RunButton>
        </div>
        {isSpecOpen && (
          <RunButton onClick={runSpec} disabled={status === "initialising"}>
            Run suite
          </RunButton>
        )}
      </div>

      <Toggle id="verbose" disabled={status === "initialising"} onChange={setVerbose} checked={verbose}>
        Verbose
      </Toggle>
    </div>
  );
};
