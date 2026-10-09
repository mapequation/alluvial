import * as d3 from "d3";
import { motion } from "framer-motion";
import { observer } from "mobx-react";
import { useEffect, useRef } from "react";
import useEventListener from "../hooks/useEventListener";
import {
  DiagramStore,
  DiagramStoreContext,
  useDiagramStore,
} from "../store/DiagramStore";
import highlightColor from "../utils/highlight-color";
import "./Diagram.css";
import DropShadows from "./DropShadows";
import Network from "./Network";
import SelectedModule from "./SelectedModule";
import { RenderTooltip, RenderTooltipContext } from "./TooltipContext";

export type { RenderTooltip } from "./TooltipContext";

export type DiagramViewProps = {
  store: DiagramStore;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  renderTooltip?: RenderTooltip;
  className?: string;
  id?: string;
};

const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 1000]);

type DiagramSvgProps = Omit<DiagramViewProps, "store" | "renderTooltip">;

const DiagramSvg = observer(function DiagramSvg({
  width,
  height,
  offsetX = 0,
  offsetY = 0,
  className,
  id = "alluvialSvg",
}: DiagramSvgProps) {
  const ref = useRef<SVGSVGElement>(null);
  const store = useDiagramStore();
  const { diagram, defaultHighlightColor, highlightColors, updateFlag } = store;
  const fillColor = highlightColor(defaultHighlightColor, highlightColors);

  useEventListener("click", () => store.setSelectedModule(null), ref);

  useEffect(() => {
    const currentRef = ref?.current;
    if (!currentRef) return;

    d3.select(currentRef).call(zoom).on("dblclick.zoom", null);

    const zoomable = currentRef?.getElementById("zoomable");

    zoom.on("zoom", (event) =>
      zoomable?.setAttribute("transform", event.transform)
    );
  }, [ref, store]);

  useEventListener("keydown", (event) => {
    if (store.editMode) return;

    // @ts-ignore
    const key = event?.key;

    if (key === "w") {
      store.moveSelectedModule("up");
    } else if (key === "s") {
      store.moveSelectedModule("down");
    } else if (key === "a") {
      store.moveNetwork("left");
    } else if (key === "d") {
      store.moveNetwork("right");
    } else if (key === "e" && store.selectedModule != null) {
      store.expand(store.selectedModule);
    } else if (key === "c" && store.selectedModule != null) {
      store.regroup(store.selectedModule);
    } else if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)
    ) {
      event.preventDefault();

      const direction = key.replace("Arrow", "").toLowerCase() ?? "";
      store.selectModule(direction as "up" | "down" | "left" | "right");
    }
  });

  const maxDropShadowModuleLevel = 3;

  const x = Math.max((width - diagram.width) / 2, 100) + offsetX;
  const y = Math.max((height - diagram.height) / 3, 100) + offsetY;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
      id={id}
      className={[`updateFlag-${updateFlag}`, className]
        .filter(Boolean)
        .join(" ")}
      data-width={diagram.width}
      data-height={diagram.height}
    >
      <defs>
        <DropShadows maxLevel={maxDropShadowModuleLevel} />
      </defs>
      <rect className="background" width={width} height={height} fill="#fff" />
      <g id="zoomable">
        <motion.g
          id="translate-center"
          initial={false}
          animate={{ x, y }}
          transition={{ duration: 0.2, bounce: 0 }}
        >
          {diagram.children.map((network) => (
            <Network key={network.id} network={network} fillColor={fillColor} />
          ))}
          <SelectedModule module={store.selectedModule} />
        </motion.g>
      </g>
    </svg>
  );
});

export const DiagramView = observer(function DiagramView({
  store,
  renderTooltip,
  ...rest
}: DiagramViewProps) {
  return (
    <DiagramStoreContext.Provider value={store}>
      <RenderTooltipContext.Provider value={renderTooltip}>
        <DiagramSvg {...rest} />
      </RenderTooltipContext.Provider>
    </DiagramStoreContext.Provider>
  );
});
