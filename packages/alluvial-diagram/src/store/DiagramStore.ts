import { action, makeObservable, observable } from "mobx";
import { createContext, useContext } from "react";
import {
  Diagram,
  Identifier,
  LEFT,
  Module,
  NOT_HIGHLIGHTED,
  RIGHT,
} from "../alluvial";
import type {
  ModuleOrder,
  ModuleSize,
  VerticalAlign,
} from "../alluvial/Diagram";
import TreePath from "../utils/TreePath";

export class DiagramStore {
  diagram = new Diagram();
  identifier: Identifier = "id";

  // hack to force updates when we call updateLayout
  updateFlag = true;

  height: number = 600;
  duration: number = 0.2;
  marginExponent: number = 4;
  zeroMargins: boolean = false;
  moduleWidth: number = 80;
  streamlineFraction: number = 2;
  streamlineThreshold: number = 1;
  streamlineOpacity: number = 0.8;
  flowThreshold: number = 5e-3;

  defaultHighlightColor: string = "#b6b69f";
  highlightColors: string[] = [];

  verticalAlign: VerticalAlign = "bottom";
  moduleSize: ModuleSize = "flow";
  sortModulesBy: ModuleOrder = "flow";

  showModuleId: boolean = false;
  showModuleNames: boolean = true;
  multilineModuleNames: boolean = true;
  showNetworkNames: boolean = true;
  aggregateStateNames: boolean = true;
  titleCaseModuleNames: boolean = false;

  hierarchicalModules: "none" | "outline" | "shadow" = "shadow";
  hierarchicalModuleOffset: number = 5;
  hierarchicalModuleOpacity: number = 0.5;

  dropShadow: boolean = false;
  fontSize: number = 8;
  networkFontSize: number = 10;
  adaptiveFontSize: boolean = false;

  selectedModule: Module | null = null;

  editMode: boolean = false;

  showBipartiteNodes = true;

  constructor() {
    makeObservable(this, {
      diagram: observable.ref,
      identifier: observable,
      updateFlag: observable,
      height: observable,
      duration: observable,
      marginExponent: observable,
      zeroMargins: observable,
      moduleWidth: observable,
      streamlineFraction: observable,
      streamlineThreshold: observable,
      streamlineOpacity: observable,
      flowThreshold: observable,
      defaultHighlightColor: observable,
      highlightColors: observable,
      verticalAlign: observable,
      moduleSize: observable,
      sortModulesBy: observable,
      showModuleId: observable,
      showModuleNames: observable,
      multilineModuleNames: observable,
      showNetworkNames: observable,
      aggregateStateNames: observable,
      titleCaseModuleNames: observable,
      hierarchicalModules: observable,
      hierarchicalModuleOffset: observable,
      hierarchicalModuleOpacity: observable,
      dropShadow: observable,
      fontSize: observable,
      networkFontSize: observable,
      adaptiveFontSize: observable,
      selectedModule: observable,
      editMode: observable,
      showBipartiteNodes: observable,
    });
  }

  setIdentifier = action((identifier: Identifier) => {
    this.identifier = identifier;
  });

  setHeight = action((height: number) => {
    this.height = height;
    this.updateLayout();
  });

  setDuration = action((duration: number) => {
    this.duration = duration;
  });

  setMarginExponent = action((marginExponent: number) => {
    this.marginExponent = marginExponent;
    this.updateLayout();
  });

  setZeroMargins = action((zeroMargin: boolean) => {
    this.zeroMargins = zeroMargin;
    this.updateLayout();
  });

  setModuleWidth = action((moduleWidth: number) => {
    this.moduleWidth = moduleWidth;
    this.updateLayout();
  });

  setStreamlineFraction = action((streamlineFraction: number) => {
    this.streamlineFraction = streamlineFraction;
    this.updateLayout();
  });

  setStreamlineThreshold = action((streamlineThreshold: number) => {
    this.streamlineThreshold = streamlineThreshold;
    this.updateLayout();
  });

  setStreamlineOpacity = action((streamlineOpacity: number) => {
    this.streamlineOpacity = streamlineOpacity;
  });

  setFlowThreshold = action((flowThreshold: number) => {
    this.flowThreshold = flowThreshold;
    this.updateLayout();
  });

  setDefaultHighlightColor = action((defaultHighlightColor: string) => {
    this.defaultHighlightColor = defaultHighlightColor;
  });

  setHighlightColors = action((highlightColors: string[]) => {
    this.highlightColors = highlightColors;
  });

  getHighlightIndex = action((highlightColor: string) => {
    if (highlightColor === this.defaultHighlightColor) {
      return -1;
    }

    const colors = this.highlightColors;

    if (colors.includes(highlightColor)) {
      return colors.indexOf(highlightColor);
    }

    const index = colors.push(highlightColor) - 1;

    this.highlightColors = [...colors];

    return index;
  });

  getHighlightColor(highlightIndex?: number, defaultHighlightColor?: string) {
    if (
      highlightIndex == null ||
      highlightIndex > this.highlightColors.length - 1
    )
      return undefined;
    if (highlightIndex === NOT_HIGHLIGHTED)
      return defaultHighlightColor ?? this.defaultHighlightColor;
    return this.highlightColors[highlightIndex];
  }

  setVerticalAlign = action((verticalAlign: VerticalAlign) => {
    this.verticalAlign = verticalAlign;
    this.updateLayout();
  });

  setModuleSize = action((moduleSize: ModuleSize) => {
    this.moduleSize = moduleSize;
    this.updateLayout();
  });

  setSortModulesBy = action((sortModulesBy: ModuleOrder) => {
    this.sortModulesBy = sortModulesBy;
    this.updateLayout();
  });

  setShowModuleId = action((showModuleId: boolean) => {
    this.showModuleId = showModuleId;
  });

  setShowModuleNames = action((showModuleNames: boolean) => {
    this.showModuleNames = showModuleNames;
  });

  setMultilineModuleNames = action((multilineModuleNames: boolean) => {
    this.multilineModuleNames = multilineModuleNames;
  });

  setShowNetworkNames = action((showNetworkNames: boolean) => {
    this.showNetworkNames = showNetworkNames;
  });

  setAggregateStateNames = action((aggregateStateNames: boolean) => {
    this.aggregateStateNames = aggregateStateNames;
  });

  setTitleCaseModuleNames = action((titleCaseModuleNames: boolean) => {
    this.titleCaseModuleNames = titleCaseModuleNames;
  });

  setHierarchicalModules = action(
    (hierarchicalModules: "none" | "outline" | "shadow") => {
      this.hierarchicalModules = hierarchicalModules;
    }
  );

  setHierarchicalModuleOffset = action((hierarchicalModuleOffset: number) => {
    this.hierarchicalModuleOffset = hierarchicalModuleOffset;
  });

  setHierarchicalModuleOpacity = action((hierarchicalModuleOpacity: number) => {
    this.hierarchicalModuleOpacity = hierarchicalModuleOpacity;
  });

  setDropShadow = action((dropShadow: boolean) => {
    this.dropShadow = dropShadow;
  });

  setFontSize = action((fontSize: number) => {
    this.fontSize = fontSize;
  });

  setNetworkFontSize = action((fontSize: number) => {
    this.networkFontSize = fontSize;
  });

  setAdaptiveFontSize = action((value: boolean) => {
    this.adaptiveFontSize = value;
  });

  setSelectedModule = action((selectedModule: Module | null) => {
    this.selectedModule = selectedModule;
  });

  setEditMode = action((editMode: boolean) => {
    this.editMode = editMode;
  });

  setModuleName = action((module: Module, name: string) => {
    module.name = name;
    this.toggleUpdate();
  });

  setNetworkName = action((networkId: string, name: string) => {
    const network = this.diagram.getNetwork(networkId);
    if (network) {
      network.name = name;
      this.toggleUpdate();
    }
  });

  setShowBipartiteNodes = action((showBipartiteNodes: boolean) => {
    this.showBipartiteNodes = showBipartiteNodes;
    this.diagram.children.forEach((network) => {
      if (!network.isBipartite) return;

      network.toggleShowBipartiteNodes(showBipartiteNodes);
    });

    this.updateLayout();
  });

  toggleUpdate = action(() => {
    this.updateFlag = !this.updateFlag;
  });

  selectModule(direction: "up" | "down" | "left" | "right") {
    if (!this.selectedModule) return;

    if (direction === "up" || direction === "down") {
      const modules = this.selectedModule.parent?.visibleChildren ?? [];
      const index = this.selectedModule.parentIndex;
      if (direction === "up" && index < modules.length - 1) {
        this.setSelectedModule(modules[index + 1]);
      } else if (direction === "down" && index > 0) {
        this.setSelectedModule(modules[index - 1]);
      }
    } else if (direction === "left" || direction === "right") {
      const side = direction === "left" ? LEFT : RIGHT;
      const modules = this.selectedModule.getSimilarModules(side, 1);
      if (modules.length) {
        this.setSelectedModule(modules[0].module);
      }
    }
  }

  expand(module: Module) {
    const { parent, moduleId } = module;
    const success = module.expand();
    if (!success) return false;
    this.updateLayout();

    const visibleSubModules = parent.children.filter(
      (module) => module.isVisible && module.moduleId.startsWith(moduleId)
    );

    if (visibleSubModules.length > 0) {
      const largestSubModule = visibleSubModules.reduce((max, module) =>
        module.flow > max.flow ? module : max
      );
      this.setSelectedModule(largestSubModule);
    }
    return success;
  }

  regroup(module: Module) {
    const { parent, moduleId } = module;
    const success = module.regroup();
    if (!success) return false;
    this.updateLayout();

    const parentModuleId = TreePath.parentPath(moduleId)?.toString() ?? null;
    if (parentModuleId) {
      const superModule = parent.getModule(parentModuleId) ?? null;
      if (superModule != null) {
        this.setSelectedModule(superModule);
      }
    }
    return success;
  }

  updateLayout() {
    this.diagram.calcFlow();
    this.diagram.updateLayout(this);
    this.toggleUpdate();
  }

  resetLayout() {
    this.diagram.children.forEach(
      (network) => (network.isCustomSorted = false)
    );
    this.updateLayout();
  }

  moveSelectedModule(direction: "up" | "down") {
    if (!this.selectedModule) return;

    const didMove = this.selectedModule.move(direction);

    if (didMove) {
      this.diagram.updateLayout(this);
      this.toggleUpdate();
    }

    return didMove;
  }

  // Subclasses (e.g. an app-level Store that also tracks file metadata) may
  // override this with the bookkeeping they need; the default reorders the
  // diagram's networks and updates the selection.
  moveNetwork(direction: "left" | "right") {
    const selectedModule = this.selectedModule;
    if (!selectedModule) return;

    const network = this.diagram.getNetwork(selectedModule.networkId);
    if (!network) return;

    const index = this.diagram.children.indexOf(network);
    const newIndex = index + (direction === "left" ? LEFT : RIGHT);

    if (newIndex < 0 || newIndex > this.diagram.children.length - 1) {
      return;
    }

    const [moved] = this.diagram.children.splice(index, 1);
    this.diagram.children.splice(newIndex, 0, moved);

    this.updateLayout();

    const newModule =
      this.diagram.children[newIndex].getModule(selectedModule.moduleId) ??
      null;
    this.setSelectedModule(newModule);
  }
}

export const DiagramStoreContext = createContext<DiagramStore>(
  new DiagramStore()
);

export function useDiagramStore(): DiagramStore {
  return useContext(DiagramStoreContext);
}
