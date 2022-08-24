import React from "react";
import { Status } from ".";
import { RunButton } from "./RunButton";

type Props = {
  onChange: () => void;
  checked: boolean;
  id: string;
  disabled: boolean;
};

export const Toggle: React.FC<Props> = ({ disabled, id, checked, onChange, children }) => {
  return (
    <label htmlFor={id} className="inline-flex relative items-center cursor-pointer">
      <input
        disabled={disabled}
        type="checkbox"
        value=""
        checked={checked}
        id={id}
        className="sr-only peer"
        onChange={onChange}
      />
      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
      <span className="ml-2 text-white">{children}</span>
    </label>
  );
};
