import classNames from "classnames";
import React from "react";
import { Test } from "./Message";
import { Tests } from "./Tests";

export type Describe = {
  name: string;
  tests: { [testName: string]: Test };
  describes: { [describeName: string]: Describe };
};

export const Describes: React.FC<{ describes: Array<Describe> }> = ({ describes }) => {
  return (
    <div>
      {describes.map((describe) => (
        <Describe describe={describe} />
      ))}
    </div>
  );
};

const Describe: React.FC<{ describe: Describe }> = ({ describe }) => {
  if (Object.values(describe.describes).length === 0 && Object.values(describe.tests).length === 0) {
    return null;
  }

  const tests = Object.values(describe.tests);
  const describes = Object.values(describe.describes);

  return (
    <div className="ml-4">
      <div className="">
        <div className={classNames("mb-2 text-white", {})}>{describe.name}</div>

        <Tests tests={tests} />

        <Describes describes={describes} />
      </div>
    </div>
  );
};
