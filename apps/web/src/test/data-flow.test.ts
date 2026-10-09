import { parse } from "@mapequation/infomap-parser";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  Diagram,
  Module,
  createFile,
  setIdentifiers,
} from "@mapequation/alluvial-diagram";
import { Store } from "../store/Store";

function loadScienceNetworks() {
  const years = [2001, 2003, 2005, 2007];
  return years.map((year) => {
    const text = readFileSync(
      resolve(__dirname, `../../public/data/science${year}_2y.stree`),
      "utf8"
    );
    const network = parse(text, undefined, true, false);
    setIdentifiers(network.nodes, "stree", "name");
    const emptyFile = new File([], `science${year}_2y.stree`);
    return createFile(emptyFile, "stree", {
      name: year.toString(),
      ...network,
    });
  });
}

describe("data flow", () => {
  it("parses each example stree file and yields nodes with flow", () => {
    const files = loadScienceNetworks();
    expect(files).toHaveLength(4);
    for (const file of files) {
      expect(file.haveModules).toBe(true);
      expect(file.nodes.length).toBeGreaterThan(0);
      const withFlow = file.nodes.filter((n: any) => n.flow > 0).length;
      expect(withFlow).toBeGreaterThan(0);
    }
  });

  it("builds a Diagram with networks and Module children", () => {
    const files = loadScienceNetworks();
    const diagram = new Diagram(files);
    expect(diagram.children).toHaveLength(4);
    for (const network of diagram.children) {
      expect(network.children.length).toBeGreaterThan(0);
      expect(network.children[0]).toBeInstanceOf(Module);
    }
  });

  it("Store.setFiles propagates flow so modules become visible", () => {
    const files = loadScienceNetworks();
    const store = new Store();
    store.setFiles(files);

    expect(store.diagram.children).toHaveLength(4);
    for (const network of store.diagram.children) {
      expect(network.children.length).toBeGreaterThan(0);
      expect(network.visibleChildren.length).toBeGreaterThan(0);
      // Each visible module has at least one HighlightGroup child with rects.
      for (const m of network.visibleChildren) {
        expect(m.children.length).toBeGreaterThan(0);
      }
      // hierarchicalChildren is what ModulesWrapper iterates by default.
      expect(network.hierarchicalChildren.length).toBeGreaterThan(0);
    }
  });
});
