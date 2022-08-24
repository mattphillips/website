import { RunIcon } from "@codesandbox/sandpack-react";
import React from "react";

export const RunButton: React.FC<{ onClick: () => void }> = ({ children, onClick }) => {
  return (
    <button className="flex items-center bg-gray-700 text-gray-50 pl-1 pr-3 rounded-lg" onClick={onClick}>
      <RunIcon />
      {children}
    </button>
  );
};
