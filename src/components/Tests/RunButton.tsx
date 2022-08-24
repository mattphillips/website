import { RunIcon } from "@codesandbox/sandpack-react";
import React from "react";

export const RunButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ children, onClick, disabled }) => {
  return (
    <button
      className="flex items-center bg-gray-700 text-gray-50 text-xs pl-1 pr-3 rounded-lg"
      onClick={onClick}
      disabled={disabled}
    >
      <RunIcon />
      {children}
    </button>
  );
};
