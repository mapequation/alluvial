import { render } from "@testing-library/react";
import { parse } from "@mapequation/infomap-parser";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DiagramView,
  createFile,
  setIdentifiers,
} from "@mapequation/alluvial-diagram";
import { Provider } from "../components/ui/provider";
import { Store, StoreContext } from "../store/Store";

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

describe("Diagram rendering", () => {
  it("renders at least one g.module per network after Store.setFiles", () => {
    const files = loadScienceNetworks();
    const store = new Store();
    store.setFiles(files);

    const { container } = render(
      <Provider enableSystem defaultTheme="light">
        <StoreContext.Provider value={store}>
          <DiagramView store={store} width={1024} height={768} />
        </StoreContext.Provider>
      </Provider>
    );

    const networks = container.querySelectorAll("g.network");
    expect(networks.length).toBe(4);

    for (const network of networks) {
      // ModulesWrapper renders either g.module (Module component) or
      // rect.super-module (Shadow/OutlineModule). At least one must exist.
      const modules = network.querySelectorAll(
        "g.module, rect.super-module"
      );
      expect(modules.length).toBeGreaterThan(0);
    }
  });
});
