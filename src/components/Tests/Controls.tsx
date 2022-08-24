import React from "react";
import { Status } from ".";
import { RunButton } from "./RunButton";

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

      <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer">
        <input
          disabled={status === "initialising"}
          type="checkbox"
          value=""
          checked={verbose}
          id="default-toggle"
          className="sr-only peer"
          onChange={setVerbose}
        />
        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
        <span className="ml-2 text-white ">Verbose</span>
      </label>
    </div>
  );
};
