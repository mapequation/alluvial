import {
  DiagramStore,
  Diagram,
  LEFT,
  LeafNode,
  Module,
  NOT_HIGHLIGHTED,
  RIGHT,
  Side,
} from "@mapequation/alluvial-diagram";
import type { NetworkFile, Real } from "@mapequation/alluvial-diagram";
import { action, makeObservable, observable } from "mobx";
import { createContext } from "react";
import type { Histogram } from "../components/Sidebar/Metadata/Real";
import BipartiteGraph from "./BipartiteGraph";
import { COLOR_SCHEMES, ColorScheme, SchemeName } from "./schemes";

export class Store extends DiagramStore {
  files: NetworkFile[] = [];
  numNetworks = 0;

  selectedScheme: ColorScheme = COLOR_SCHEMES["C3 Sinebow"];
  selectedSchemeName: SchemeName = "C3 Sinebow";

  constructor() {
    super();

    this.highlightColors = [...this.selectedScheme];

    makeObservable(this, {
      files: observable.ref,
      numNetworks: observable,
      selectedScheme: observable.ref,
      selectedSchemeName: observable,
    });
  }

  private checkColors(networks: any[]) {
    let colors: string[] = [];
    const colorIndices = new Map();

    for (let network of networks) {
      if (Array.isArray(network?.colors)) {
        // Colors are specified on the top level, nodes have highlightIndex.
        network.colors?.forEach((color: string) => {
          if (!colorIndices.has(color)) {
            colors.push(color);
            const dummyIndex = 0;
            colorIndices.set(color, dummyIndex);
          }
        });
      } else if (network?.colors === true) {
        // Colors are specified on the nodes, need to set highlightIndex.
        network.nodes?.forEach((node: any) => {
          if (node?.color != null) {
            if (!colorIndices.has(node.color)) {
              node.highlightIndex = colors.push(node.color) - 1;
              colorIndices.set(node.color, node.highlightIndex);
            } else {
              node.highlightIndex = colorIndices.get(node.color);
            }
          }
        });
      }
    }

    this.setHighlightColors(colors);
  }

  setNetworks = action((networks: any[], selectLargest = true) => {
    console.time("Store.setNetworks");

    this.checkColors(networks);

    this.setSelectedModule(null);
    this.diagram = new Diagram(networks);
    this.numNetworks = networks.length;
    this.updateLayout();

    // Select the largest module in the leftmost network.
    if (selectLargest) {
      this.setSelectedModule(this.diagram.children[0]?.children[0]);
    }

    console.timeEnd("Store.setNetworks");
  });

  setFiles = action((files: NetworkFile[], selectLargest = true) => {
    this.files = files;
    this.setNetworks(files, selectLargest);
  });

  setSelectedScheme = action((scheme: SchemeName) => {
    this.selectedSchemeName = scheme;
    this.selectedScheme = COLOR_SCHEMES[scheme];
  });

  // Override DiagramStore.moveNetwork so we also keep the files array in sync.
  override moveNetwork(direction: "left" | "right") {
    const selectedModule = this.selectedModule;
    if (!selectedModule) return;

    console.time("Store.moveNetwork");

    const network = this.diagram.getNetwork(selectedModule.networkId)!;
    const index = this.diagram.children.indexOf(network);
    const newIndex = index + (direction === "left" ? LEFT : RIGHT);

    if (newIndex < 0 || newIndex > this.diagram.children.length - 1) {
      console.warn("Cannot move network further");
      return;
    }

    const { files } = this;

    for (const file of files) {
      const network = this.diagram.getNetwork(file.id)!;
      file.name = network.name;

      for (const node of file.nodes) {
        const leafNode = network.getLeafNode(node.identifier!)!;
        node.highlightIndex = leafNode.highlightIndex;
        node.moduleLevel = leafNode.moduleLevel;
      }
    }

    const file = files.splice(index, 1)[0];
    files.splice(newIndex, 0, file);
    this.setFiles(files, false);

    this.setSelectedModule(
      this.diagram.children[newIndex].getModule(selectedModule.moduleId)!
    );

    console.timeEnd("Store.moveNetwork");
  }

  colorModule(module: Module, color: string, updateLayout = true) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);

    if (updateLayout) {
      this.updateLayout();
    }
  }

  colorMatchingModules(module: Module, color: string, side?: Side) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);

    if (!side || side === LEFT) {
      const left = module.getSimilarModules(LEFT);
      if (left.length) {
        this.colorMatchingModules(left[0].module, color, LEFT);
      }
    }

    if (!side || side === RIGHT) {
      const right = module.getSimilarModules(RIGHT);
      if (right.length) {
        this.colorMatchingModules(right[0].module, color, RIGHT);
      }
    }

    if (!side) this.updateLayout();
  }

  colorMatchingModulesInAllNetworks() {
    this.clearColors(false);

    const networks = this.diagram.children;

    if (networks.length < 2) {
      networks[0].children.forEach((module, i) => {
        const color = this.selectedScheme[i % this.selectedScheme.length];
        this.colorModule(module, color, false);
      });
      this.updateLayout();
      return;
    }

    console.time("Store.colorMatchingModulesInAllNetworks");

    const bipartiteGraphs = [];

    for (let i = 0; i < networks.length - 1; ++i) {
      const leftNetwork = networks[i];
      const B = (bipartiteGraphs[i] = new BipartiteGraph<Module>());

      for (const module of leftNetwork) {
        module
          .getSimilarModules(RIGHT, 1)
          .forEach((match) =>
            B.addLink(module, match.module, match.similarity)
          );
      }

      let highlightIndex = 0;
      for (const left of B.left) {
        let color: string;

        if (left.isHighlighted) {
          color = this.highlightColors[left.highlightIndex];
        } else {
          const largestLink = Array.from(B.links.get(left)!.keys()).reduce(
            (max, module) =>
              module.isHighlighted && max.flow < module.flow ? module : max,
            {
              flow: -Infinity,
              isHighlighted: false,
              highlightIndex: NOT_HIGHLIGHTED,
            } as Module
          );

          if (largestLink.isHighlighted) {
            color = this.highlightColors[largestLink.highlightIndex];
          } else {
            color =
              this.selectedScheme[highlightIndex % this.selectedScheme.length];
          }

          this.colorModule(left, color, false);
          highlightIndex++;
        }

        for (const right of B.links.get(left)!.keys()) {
          if (!right.isHighlighted) this.colorModule(right, color, false);
        }
      }
    }

    console.timeEnd("Store.colorMatchingModulesInAllNetworks");
    this.updateLayout();
  }

  colorNodesInModule(module: Module, color: string, updateLayout = true) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);

    this.diagram.children
      .filter((network) => network.networkId !== module.networkId)
      .forEach((network) =>
        module
          .getLeafNodes()
          .reduce((nodes, node) => {
            const oppositeNode = network.getLeafNode(node.identifier);
            if (oppositeNode) {
              oppositeNode.highlightIndex = highlightIndex;
              nodes.push(oppositeNode);
            }
            return nodes;
          }, [] as LeafNode[])
          .forEach((node) => node.update())
      );

    if (updateLayout) this.updateLayout();
  }

  colorNodesInModulesInAllNetworks(networkId: string | undefined) {
    this.clearColors(false);

    const network = this.diagram.getNetwork(
      networkId ?? this.diagram.children[0].networkId
    );

    network?.children
      .filter((module) => module.isVisible)
      .forEach((module, i) => {
        const color = this.selectedScheme[i % this.selectedScheme.length];
        this.colorNodesInModule(module, color, false);
      });

    this.updateLayout();
  }

  colorSelectedNodes(nodes: LeafNode[], color: string) {
    const highlightIndex = this.getHighlightIndex(color);
    nodes.forEach((node) => {
      node.highlightIndex = highlightIndex;
      node.update();
      this.diagram.children.forEach((network) => {
        if (network.networkId === node.networkId) return;
        const other = network.getLeafNode(node.identifier);
        if (!other) return;
        other.highlightIndex = highlightIndex;
        other.update();
      });
    });
    this.updateLayout();
  }

  colorModuleIds(module: Module, color: string) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);
    const { moduleId } = module;

    this.diagram.children
      .filter((network) => network.networkId !== module.networkId)
      .forEach((network) =>
        network.children.forEach((module) => {
          if (module.isVisible && module.moduleId === moduleId) {
            module.setColor(highlightIndex);
          }
        })
      );

    this.updateLayout();
  }

  colorModuleIdsInAllNetworks() {
    const moduleIdColorMap = new Map();

    const setModuleColor = (module: Module) => {
      const color = moduleIdColorMap.get(module.moduleId);
      if (color) {
        const highlightIndex = this.getHighlightIndex(color);
        module.setColor(highlightIndex);
      } else {
        const color =
          this.selectedScheme[
          moduleIdColorMap.size % this.selectedScheme.length
          ];
        moduleIdColorMap.set(module.moduleId, color);
        const highlightIndex = this.getHighlightIndex(color);
        module.setColor(highlightIndex);
      }
    };

    // If we only have one expanded multilayer network,
    // sort all modules and assign "higher" colors to the largest modules.
    const multilayerNetworkId = this.diagram.children[0]?.originalId;
    if (
      this.diagram.children.every(
        (network) =>
          network.layerId != null && network.originalId === multilayerNetworkId
      )
    ) {
      const modulesById: {
        [moduleId: string]: { flow: number; modules: Module[] };
      } = {};

      this.diagram.children.forEach((network) =>
        network.children.forEach((module) => {
          if (module.isVisible) {
            if (!modulesById[module.moduleId]) {
              modulesById[module.moduleId] = { flow: 0, modules: [] };
            }
            modulesById[module.moduleId].flow += module.flow;
            modulesById[module.moduleId].modules.push(module);
          }
        })
      );

      const modules = Array.from(Object.values(modulesById));
      modules.sort((a, b) => b.flow - a.flow);
      modules.forEach(({ modules }) => modules.forEach(setModuleColor));
    } else {
      this.diagram.children.forEach((network) =>
        network.children.forEach((module) => {
          if (module.isVisible) {
            setModuleColor(module);
          }
        })
      );
    }

    this.updateLayout();
  }

  colorByLayer() {
    const layerIdColorMap = new Map();

    this.diagram.children.forEach((network) => {
      network.children.forEach((module) => {
        if (module.isVisible) {
          module.getLeafNodes().forEach((node) => {
            if (node.layerId == null) return;

            if (!layerIdColorMap.has(node.layerId)) {
              let color =
                this.selectedScheme[
                layerIdColorMap.size % this.selectedScheme.length
                ];
              layerIdColorMap.set(node.layerId, color);
            }

            let color = layerIdColorMap.get(node.layerId);
            node.highlightIndex = this.getHighlightIndex(color);
            node.update();
          });
        }
      });
    });

    this.updateLayout();
  }

  colorByPhysicalId() {
    const physicalIdColorMap = new Map();

    this.diagram.children.forEach((network) => {
      network.children.forEach((module) => {
        if (module.isVisible) {
          module.getLeafNodes().forEach((node) => {
            if (!physicalIdColorMap.has(node.nodeId)) {
              let color =
                this.selectedScheme[
                physicalIdColorMap.size % this.selectedScheme.length
                ];
              physicalIdColorMap.set(node.nodeId, color);
            }

            let color = physicalIdColorMap.get(node.nodeId);
            node.highlightIndex = this.getHighlightIndex(color);
            node.update();
          });
        }
      });
    });

    this.updateLayout();
  }

  colorCategoricalMetadata(name: string, colors: Map<string, string>) {
    this.clearColors(false);

    for (const color of colors.values()) {
      // FIXME This is used to get the highlight indices sorted as the color scheme.
      this.getHighlightIndex(color);
    }

    this.diagram.children.forEach((network) => {
      if (!network.haveMetadata) return;

      network.children.forEach((module) => {
        if (!module.isVisible) return;

        module.getLeafNodes().forEach((node) => {
          if (
            !node.metadata ||
            !(name in node.metadata) ||
            typeof node.metadata[name] !== "string"
          )
            return;

          const meta = node.metadata[name] as string;

          if (colors.has(meta)) {
            node.highlightIndex = this.getHighlightIndex(colors.get(meta)!);
            node.update();
          }
        });
      });
    });

    this.updateLayout();
  }

  colorRealMetadata(name: string, bins: Histogram) {
    this.clearColors(false);

    for (const bin of bins) {
      // FIXME This is used to get the highlight indices sorted as the color scheme.
      this.getHighlightIndex(bin.color);
    }

    this.diagram.children.forEach((network) => {
      if (!network.haveMetadata) return;

      network.children.forEach((module) => {
        if (!module.isVisible) return;

        module.getLeafNodes().forEach((node) => {
          if (
            !node.metadata ||
            !(name in node.metadata) ||
            typeof node.metadata[name] !== "number"
          )
            return;

          const meta = node.metadata[name] as number;

          for (const bin of bins) {
            if (meta >= bin.x0 && meta < bin.x1) {
              node.highlightIndex = this.getHighlightIndex(bin.color);
              node.update();
              break;
            }
          }
        });
      });
    });

    this.updateLayout();
  }

  colorRealIntervals(
    name: string,
    data: Real,
    getColor: (meta: number) => string,
    centers: number[]
  ) {
    this.clearColors(false);

    for (const c of centers) {
      // FIXME This is used to get the highlight indices sorted as the color scheme.
      this.getHighlightIndex(getColor(c));
    }

    this.diagram.children.forEach((network) => {
      if (!network.haveMetadata) return;

      network.children.forEach((module) => {
        if (!module.isVisible) return;

        module.getLeafNodes().forEach((node) => {
          if (
            !node.metadata ||
            !(name in node.metadata) ||
            typeof node.metadata[name] !== "number"
          )
            return;

          const meta = node.metadata[name] as number;

          node.highlightIndex = this.getHighlightIndex(getColor(meta));
          node.update();
        });
      });
    });

    this.updateLayout();
  }

  clearColors(updateLayout = true) {
    for (let network of this.diagram) {
      const modules = [];
      for (let module of network) {
        for (let highlightGroup of module) {
          if (highlightGroup.isHighlighted) {
            modules.push(module);
            break;
          }
        }
      }
      modules.forEach((module) => module.removeColors());
    }

    this.setHighlightColors([]);

    if (updateLayout) this.updateLayout();
  }
}

export const StoreContext = createContext(new Store());
