import React from "react";

type Outcome = {
  pass: number;
  fail: number;
  skip: number;
  total: number;
};

type Summary = {
  suites: Omit<Outcome, "skip">;
  tests: Outcome;
  duration: number;
};

export const Summary: React.FC<Summary> = ({ suites, tests, duration }) => {
  const widestLabel = "Test suites: ";

  const withMargin = (label: string): string => {
    const difference = widestLabel.length - label.length;
    const margin = Array.from({ length: difference }, () => " ").join("");
    return label + margin;
  };

  return (
    <div className="text-gray-400 font-bold">
      <div className="mb-2">
        <span className="font-bold text-white">{widestLabel}</span>
        {suites.fail > 0 && <span className="text-[#fa7c75]">{suites.fail} failed, </span>}
        {suites.pass > 0 && <span className="text-[#15c213]">{suites.pass} passed, </span>}
        <span>{suites.total} total</span>
      </div>
      <div className="mb-2">
        <span className="font-bold text-white whitespace-pre">{withMargin("Tests:")}</span>
        {tests.fail > 0 && <span className="text-[#fa7c75]">{tests.fail} failed, </span>}
        {tests.skip > 0 && <span className="text-[#c1ba35]">{tests.skip} skipped, </span>}
        {tests.pass > 0 && <span className="text-[#15c213]">{tests.pass} passed, </span>}
        <span>{tests.total} total</span>
      </div>
      <div className="font-bold text-white whitespace-pre">
        {withMargin("Time:")}
        {duration / 1000}s
      </div>
    </div>
  );
};
