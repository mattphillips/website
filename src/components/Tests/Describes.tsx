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
  if (describes.length === 0) return null;
  return (
    <>
      {describes.map((describe) => (
        <Describe key={describe.name} describe={describe} />
      ))}
    </>
  );
};

const Describe: React.FC<{ describe: Describe }> = ({ describe }) => {
  if (Object.values(describe.describes).length === 0 && Object.values(describe.tests).length === 0) {
    return null;
  }

  const tests = Object.values(describe.tests);
  const describes = Object.values(describe.describes);

  return (
    <div className="ml-4" data-testid="describe-container">
      <div className={classNames("mb-2 text-white", {})}>{describe.name}</div>

      <Tests tests={tests} />

      <Describes describes={describes} />
    </div>
  );
};
