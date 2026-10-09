import { describe, expect, it } from "vitest";
import type { NetworkFile } from "../parsers/types";
import Diagram, { LayoutOpts } from "./Diagram";

// One node per module, module i has moduleFlows[i - 1] flow
function network(id: string, moduleFlows: number[]): NetworkFile {
  return {
    id,
    nodes: moduleFlows.map((flow, i) => ({
      id: i + 1,
      name: `${i + 1}`,
      identifier: `${i + 1}`,
      path: `${i + 1}:1`,
      flow,
    })),
    name: id,
    filename: `${id}.tree`,
    format: "tree",
    size: 0,
    lastModified: 0,
    haveModules: true,
  };
}

const layout: LayoutOpts = {
  height: 600,
  streamlineFraction: 2,
  moduleWidth: 80,
  flowThreshold: 0,
  verticalAlign: "bottom",
  marginExponent: 4,
  zeroMargins: false,
  moduleSize: "flow",
  sortModulesBy: "flow",
};

function visibleModuleIds(diagram: Diagram, networkId: string) {
  return diagram
    .getNetwork(networkId)!
    .visibleChildren.map((module) => module.moduleId)
    .sort();
}

describe("visible flow", () => {
  const flows = [0.95, 0.04, 0.004, 0.003, 0.002, 0.001];

  const createDiagram = () => {
    const diagram = new Diagram([
      network(
        "A",
        flows.map((flow) => flow / 2)
      ),
      network("B", flows),
    ]);
    diagram.calcFlow();
    return diagram;
  };

  it("shows all modules at 100%", () => {
    const diagram = createDiagram();
    diagram.updateLayout({ ...layout, flowThreshold: 0 });

    expect(visibleModuleIds(diagram, "A")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
    expect(visibleModuleIds(diagram, "B")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
  });

  it("hides the smallest modules holding at most the hidden fraction of each network's flow", () => {
    const diagram = createDiagram();
    // Visible flow 99.5%: hide at most 0.5% of each network's flow.
    // Modules 5 and 6 hold 0.3%, adding module 4 would hide 0.6%.
    diagram.updateLayout({ ...layout, flowThreshold: 0.005 });

    expect(visibleModuleIds(diagram, "A")).toEqual(["1", "2", "3", "4"]);
    expect(visibleModuleIds(diagram, "B")).toEqual(["1", "2", "3", "4"]);
  });

  it("updates the visible modules when the visible flow changes", () => {
    const diagram = createDiagram();
    diagram.updateLayout({ ...layout, flowThreshold: 0.03 });
    expect(visibleModuleIds(diagram, "B")).toEqual(["1", "2"]);

    diagram.updateLayout({ ...layout, flowThreshold: 0.0015 });
    expect(visibleModuleIds(diagram, "B")).toEqual(["1", "2", "3", "4", "5"]);
  });
});
