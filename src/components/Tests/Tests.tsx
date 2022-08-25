import classNames from "classnames";
import React from "react";
import { Test } from "./Message";

export const Tests: React.FC<{ tests: Array<Test> }> = ({ tests }) => {
  if (tests.length === 0) return null;

  return (
    <div className="ml-4" data-testid="test-container">
      {tests.map((test) => (
        <Test key={test.name} test={test} />
      ))}
    </div>
  );
};

const Test: React.FC<{ test: Test }> = ({ test }) => {
  return (
    <div className={classNames("mb-2 text-gray-400", {})} data-testid="test">
      {test.status === "pass" && <span className="mr-2 text-[#15c213]">✓</span>}
      {test.status === "fail" && <span className="mr-2 text-[#f7362b]">✕</span>}
      {test.status === "idle" && <span className="mr-2 text-[#c1ba35]">○</span>}
      {test.name}
      {test.duration !== undefined && <span className="ml-2">({test.duration} ms)</span>}
    </div>
  );
};
