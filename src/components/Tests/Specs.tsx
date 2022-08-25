import classNames from "classnames";
import React from "react";
import { Status } from ".";
import { Describe, Describes } from "./Describes";
import { FormattedError } from "./FormattedError";
import { Test, TestError } from "./Message";
import { Tests } from "./Tests";

export type Spec = { error?: TestError } & Describe;

type Props = {
  specs: Array<Spec>;
  verbose: boolean;
  status: Status;
  openSpec: (name: string) => void;
};

export const Specs: React.FC<Props> = ({ specs, openSpec, status, verbose }) => {
  return (
    <>
      {specs.map((spec) => (
        <Spec key={spec.name} spec={spec} openSpec={openSpec} status={status} verbose={verbose} />
      ))}
    </>
  );
};

const Spec: React.FC<Omit<Props, "specs"> & { spec: Spec }> = ({ spec, verbose, status, openSpec }) => {
  if (spec.error) {
    return (
      <div className="mb-2">
        <SpecLabel className="bg-[#f7362b]">Error</SpecLabel>
        <FilePath onClick={() => openSpec(spec.name)} path={spec.name} />
        <FormattedError error={spec.error} path={spec.name} />
      </div>
    );
  }

  // TODO: Use combinators
  if (Object.values(spec.describes).length === 0 && Object.values(spec.tests).length === 0) {
    return null;
  }

  /* TODO: Don't recompute this here */
  const stats = getStats(spec);
  const tests = Object.values(spec.tests);
  const describes = Object.values(spec.describes);

  return (
    <div className="mb-2" data-testid="spec-container">
      <div className="flex flex-row items-center mb-2">
        {status === "complete" &&
          (stats.fail > 0 ? (
            <SpecLabel className="bg-[#f7362b]">Fail</SpecLabel>
          ) : (
            <SpecLabel className="bg-[#15c213]">Pass</SpecLabel>
          ))}

        <FilePath onClick={() => openSpec(spec.name)} path={spec.name} />
      </div>

      {verbose && <Tests tests={tests} />}

      {verbose && <Describes describes={describes} />}

      {getFailingTests(spec).map((test) => {
        return (
          <div key={`failing-${test.name}`} data-testid="failing-test" className="mb-2 last:mb-0">
            <div className="text-[#fa7c75] font-bold">
              ● {test.blocks.join(" › ")} › {test.name}
            </div>
            {test.errors.map((e) => (
              <FormattedError key={`failing-${test.name}-error`} error={e} path={test.path} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

const SpecLabel: React.FC<{ className: string }> = ({ children, className }) => {
  return (
    <span className={classNames("px-2 py-1 mr-2 font-[Consolas,_Monaco,_monospace] uppercase", className)}>
      {children}
    </span>
  );
};

const FilePath: React.FC<{ onClick: () => void; path: string }> = ({ onClick, path }) => {
  const parts = path.split("/");
  const basePath = parts.slice(0, parts.length - 1).join("/") + "/";
  const fileName = parts[parts.length - 1];
  return (
    <button className="font-[Consolas,_Monaco,_monospace]" onClick={onClick}>
      <span className="text-gray-400 decoration-dotted underline">{basePath}</span>
      <span className="text-white decoration-dotted underline">{fileName}</span>
    </button>
  );
};

const getFailingTests = (block: Describe | Spec): Array<Test> => {
  return getTests(block).filter((t) => t.status === "fail");
};

const getTests = (block: Describe | Spec): Array<Test> => {
  const tests = Object.values(block.tests);
  return tests.concat(...Object.values(block.describes).map(getTests));
};

const getStats = (spec: Spec) => {
  const allTests = getTests(spec);

  const sum = (tests: Test[]): { pass: number; fail: number; skip: number; total: number } =>
    tests.reduce(
      (acc, test) => {
        return {
          pass: test.status === "pass" ? acc.pass + 1 : acc.pass,
          fail: test.status === "fail" ? acc.fail + 1 : acc.fail,
          skip: test.status === "idle" || test.status === "running" ? acc.skip + 1 : acc.skip,
          total: acc.total + 1,
        };
      },
      { pass: 0, fail: 0, skip: 0, total: 0 }
    );

  return sum(allTests);
};
