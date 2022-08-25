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
    <div>
      {specs.map((spec) => (
        <Spec key={spec.name} spec={spec} openSpec={openSpec} status={status} verbose={verbose} />
      ))}
    </div>
  );
};

const Spec: React.FC<Omit<Props, "specs"> & { spec: Spec }> = ({ spec, verbose, status, openSpec }) => {
  const parts = spec.name.split("/");
  const path = parts.slice(0, parts.length - 1).join("/") + "/";
  const name = parts[parts.length - 1];

  if (spec.error) {
    return (
      <div className="mb-2">
        <span className="px-2 py-1 bg-[#f7362b] mr-2 font-[Consolas,_Monaco,_monospace]">ERROR</span>
        <button className="mb-2 decoration-dotted underline text-white" onClick={() => openSpec(spec.name)}>
          {spec.name}
        </button>
        <FormattedError error={spec.error} path={spec.name} />
      </div>
    );
  }

  if (Object.values(spec.describes).length === 0 && Object.values(spec.tests).length === 0) {
    return null;
  }

  /* TODO: Don't recompute this here */
  const stats = getStats(spec);
  const tests = Object.values(spec.tests);
  const describes = Object.values(spec.describes);

  return (
    <div className="mb-2">
      {status === "complete" &&
        (stats.fail > 0 ? (
          <span className="px-2 py-1 bg-[#f7362b] mr-2 font-[Consolas,_Monaco,_monospace]">FAIL</span>
        ) : (
          <span className="px-2 py-1 bg-[#15c213] mr-2 font-[Consolas,_Monaco,_monospace]">PASS</span>
        ))}
      <button className="mb-2" onClick={() => openSpec(spec.name)}>
        <span className="text-gray-400 decoration-dotted underline">{path}</span>
        <span className="text-white decoration-dotted underline">{name}</span>
      </button>

      {verbose && <Tests tests={tests} />}

      {verbose && <Describes describes={describes} />}

      {getFailingTests(spec).map((test) => {
        return (
          <div key={`failing-${test.name}`}>
            <div className="text-[#fa7c75] mt-2 font-bold">
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