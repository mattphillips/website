import React from "react";
import { Status } from ".";
import { Describe, Describes } from "./Describes";
import { Test, TestError } from "./Message";
import { Tests } from "./Tests";
import { formatDiffMessage } from "./utils";

export type Spec = { error?: TestError } & Describe;

type Props = {
  specs: Array<Spec>;
  verbose: boolean;
  status: Status;
  open: (name: string) => void;
};

export const Specs: React.FC<Props> = ({ specs, open, status, verbose }) => {
  return (
    <div>
      {specs.map((spec) => (
        <Spec spec={spec} open={open} status={status} verbose={verbose} />
      ))}
    </div>
  );
};

const Spec: React.FC<Omit<Props, "specs"> & { spec: Spec }> = ({ spec, verbose, status, open }) => {
  const parts = spec.name.split("/");
  const path = parts.slice(0, parts.length - 1).join("/") + "/";
  const name = parts[parts.length - 1];

  if (spec.error) {
    return (
      <div className="mb-2">
        <span className="px-2 py-1 bg-[#f7362b] mr-2 font-[Consolas,_Monaco,_monospace]">ERROR</span>
        <button className="mb-2 decoration-dotted underline text-white" onClick={() => open(spec.name)}>
          {spec.name}
        </button>
        <div
          className="mb-2 p-4 text-sm leading-[1.6] whitespace-pre-wrap text-white"
          dangerouslySetInnerHTML={{ __html: formatDiffMessage(spec.error, spec.name) }}
        ></div>
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
      <button className="mb-2" onClick={() => open(spec.name)}>
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
            {test.errors.map((e) => {
              return (
                <div
                  className="p-4 text-sm leading-[1.6] whitespace-pre-wrap text-white"
                  dangerouslySetInnerHTML={{ __html: formatDiffMessage(e, test.path) }}
                ></div>
              );
            })}
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
