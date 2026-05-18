# @mapequation/alluvial-diagram

Interactive alluvial diagrams for hierarchical networks. Pan, zoom, select and expand modules; drive the diagram from a MobX store, render an SVG view from React.

This package is the engine behind the [Alluvial Diagram Generator](https://www.mapequation.org/alluvial).

## Install

```bash
npm install @mapequation/alluvial-diagram
```

Peer dependencies (install if you don't already have them):

```bash
npm install react react-dom mobx mobx-react framer-motion
```

## What's in the package

- **Data + layout**: `Diagram`, `Network`, `Module`, `LeafNode`, `Branch`, `StreamlineLink`, `HighlightGroup`.
- **File parsers**: `parseAcceptedFiles`, `fetchScienceData`, `setIdentifiers`, `getLocalStorageFiles`, `calcStatistics`, `mergeMultilayerFiles`, `expandMultilayerFile`.
- **State controller**: `DiagramStore` (MobX observable) — extend it for app-specific state.
- **React renderer**: `<DiagramView>` — an SVG component reading from a `DiagramStore` via context.

## Quick start

Read partition files, build a store, render the diagram:

```tsx
import {
  Diagram,
  DiagramStore,
  DiagramView,
  parseAcceptedFiles,
} from "@mapequation/alluvial-diagram";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";

const ACCEPTED = ["tree", "ftree", "stree", "clu", "net", "json", "zip"];
const store = new DiagramStore();

export default observer(function App({ files }: { files: File[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    parseAcceptedFiles(files, [], ACCEPTED, "id").then(([parsed]) => {
      store.diagram = new Diagram(parsed);
      store.updateLayout();
      setReady(true);
    });
  }, [files]);

  if (!ready) return null;

  return (
    <DiagramView
      store={store}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
});
```

`<DiagramView>` is keyboard-aware out of the box:

| Key             | Action                              |
| --------------- | ----------------------------------- |
| Arrow keys      | Select neighbouring module          |
| `w` / `s`       | Move selected module up / down      |
| `a` / `d`       | Move network left / right           |
| `e`             | Expand selected module              |
| `c`             | Regroup (collapse) selected module  |
| Mouse wheel     | Zoom                                |
| Drag            | Pan                                 |

## Extending `DiagramStore`

`DiagramStore` owns everything the renderer reads — layout parameters, selection, highlight colors, font sizes, hierarchical-module display, etc. Subclass it to add app-specific state (file management, color schemes, metadata-driven coloring):

```ts
import {
  DiagramStore,
  Diagram,
  NetworkFile,
} from "@mapequation/alluvial-diagram";
import { action, makeObservable, observable } from "mobx";

const palette = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"];

export class AppStore extends DiagramStore {
  files: NetworkFile[] = [];

  constructor() {
    super();
    this.highlightColors = [...palette];
    makeObservable(this, { files: observable.ref });
  }

  setFiles = action((files: NetworkFile[]) => {
    this.files = files;
    this.setSelectedModule(null);
    this.diagram = new Diagram(files);
    this.updateLayout();
  });
}
```

## Loading data

Three convenience helpers cover the common input paths:

```ts
import {
  parseAcceptedFiles,   // File[] from <input type="file"> or drag-and-drop
  fetchScienceData,     // built-in example network (science 2001-2007)
  getLocalStorageFiles, // restore files persisted by @mapequation/infomap
  setIdentifiers,       // normalize node identifiers ("id" | "name")
} from "@mapequation/alluvial-diagram";

const exampleFiles = await fetchScienceData();
store.setFiles(exampleFiles);

const [uploaded, errors] = await parseAcceptedFiles(
  fileList,
  store.files,
  ["tree", "ftree", "stree", "clu", "net", "json", "zip"],
  "id",
);
```

Supported input formats: `tree`, `ftree`, `stree`, `clu`, `net`, `json`, and `zip` of any of the above.

## Custom tooltip

The renderer ships **no tooltip styling** — it exposes a render-prop slot so consumers stay framework-agnostic. Wrap the hovered module trigger in whatever component library you use:

```tsx
<DiagramView
  store={store}
  width={width}
  height={height}
  renderTooltip={({ module, fillColor, children }) => (
    <Tooltip
      content={
        <ModuleSummary module={module} fill={fillColor} />
      }
    >
      {children}
    </Tooltip>
  )}
/>
```

`children` is the SVG group `<DiagramView>` would otherwise render directly — pass it through your tooltip's trigger so hit-testing works.

## Sizing & layout

`<DiagramView>` doesn't read `window` — pass `width`/`height` from a `ResizeObserver`, parent container, or `window.innerWidth`. Use `offsetX` / `offsetY` to bias the auto-centering (e.g. to leave room for a sidebar):

```tsx
<DiagramView
  store={store}
  width={containerWidth}
  height={containerHeight}
  offsetX={-sidebarWidth / 2}
/>
```

Layout parameters (`moduleWidth`, `streamlineFraction`, `flowThreshold`, `verticalAlign`, `moduleSize`, `sortModulesBy`, …) live on `DiagramStore` as observables — change them through their setters and the renderer re-layouts:

```ts
store.setModuleWidth(120);
store.setStreamlineFraction(1.5);
store.setSortModulesBy("nodes");
```

## React API

```ts
type DiagramViewProps = {
  store: DiagramStore;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  renderTooltip?: (props: {
    module: Module;
    fillColor: (group: { highlightIndex: number; insignificant: boolean }) => string;
    children: ReactNode;
  }) => ReactNode;
  className?: string;
  id?: string;
};
```

## License

AGPL-3.0-or-later
