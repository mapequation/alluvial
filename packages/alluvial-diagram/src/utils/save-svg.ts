// Trigger a browser download of `blob` (what FileSaver.saveAs does in
// browsers that support the `download` attribute).
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 40_000);
}

/**
 * Download the SVG rendered by `DiagramView` as a standalone file, sized to
 * fit the whole diagram (pan/zoom is reset in the exported copy).
 */
export function saveSvg(svg: SVGSVGElement, filename: string) {
  const width = svg.getAttribute("width")!;
  const height = svg.getAttribute("height")!;
  const viewBox = svg.getAttribute("viewBox")!;
  let diagramWidth = Number(svg.getAttribute("data-width")) + 10;
  let diagramHeight = Number(svg.getAttribute("data-height")) + 10;

  const background = svg.querySelector(".background");

  const zoomable = svg.getElementById("zoomable");
  const zoom = zoomable?.getAttribute("transform") || "1";
  zoomable?.removeAttribute("transform");

  const translateCenter = svg.getElementById("translate-center");
  const translate = translateCenter?.getAttribute("style") || "";
  translateCenter?.removeAttribute("style");

  const labels = svg.querySelectorAll(".label");
  const groups = svg.querySelectorAll(".group");
  const superModules = svg.querySelectorAll(".super-module");
  const superModuleOffsets = svg.querySelectorAll(".super-module-offset");
  const modules = [...groups, ...superModules];

  modules.forEach((element) => {
    element.setAttribute("x", element.getAttribute("data-x")!);
    element.setAttribute("y", element.getAttribute("data-y")!);
    element.setAttribute("data-style", element.getAttribute("style")!);
    element.removeAttribute("style");
  });

  superModuleOffsets.forEach((element) => {
    const x = element.getAttribute("data-x");
    const y = element.getAttribute("data-y");
    element.setAttribute("transform", `translate(${x} ${y})`);
    element.setAttribute("data-style", element.getAttribute("style")!);
    element.removeAttribute("style");
  });

  let maxLabelWidth = -Infinity;
  let hasLabels = false;

  labels.forEach((element) => {
    hasLabels = true;
    const text = element.querySelector("text");
    const bbox = text?.getBBox();
    maxLabelWidth = Math.max(maxLabelWidth, bbox?.width || 0);
    text?.setAttribute("x", text.getAttribute("data-x")!);
    text?.setAttribute("y", text.getAttribute("data-y")!);
    text?.querySelectorAll("tspan")?.forEach((tspan) => {
      maxLabelWidth = Math.max(maxLabelWidth, tspan.getBBox()?.width ?? 0);
      tspan.setAttribute("x", text?.getAttribute("x")!);
    });
    element.setAttribute("data-style", element.getAttribute("style")!);
    element.removeAttribute("style");
  });

  if (hasLabels && maxLabelWidth > -Infinity) {
    const textPadding = 20; // From Module.namePosition
    diagramWidth += 2 * (maxLabelWidth + textPadding);
    translateCenter?.setAttribute(
      "transform",
      `translate(${maxLabelWidth + 15} 0)`
    );

    diagramHeight += 80; // Hack to fit network names
  }

  svg.setAttribute("width", diagramWidth.toString());
  svg.setAttribute("height", diagramHeight.toString());
  svg.setAttribute("viewBox", `0 0 ${diagramWidth} ${diagramHeight}`);
  background?.setAttribute("width", diagramWidth.toString());
  background?.setAttribute("height", diagramHeight.toString());

  const string = new XMLSerializer().serializeToString(svg);

  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());
  svg.setAttribute("viewBox", viewBox.toString());
  background?.setAttribute("width", width.toString());
  background?.setAttribute("height", height.toString());

  zoomable?.setAttribute("transform", zoom);
  translateCenter?.removeAttribute("transform");
  translateCenter?.setAttribute("style", translate);

  modules.forEach((element) => {
    element.removeAttribute("x");
    element.removeAttribute("y");
    element.setAttribute("style", element.getAttribute("data-style")!);
    element.removeAttribute("data-style");
  });

  superModuleOffsets.forEach((element) => {
    element.removeAttribute("transform");
    element.setAttribute("style", element.getAttribute("data-style")!);
    element.removeAttribute("data-style");
  });

  labels.forEach((element) => {
    const text = element.querySelector("text");
    text?.removeAttribute("x");
    text?.removeAttribute("y");
    text
      ?.querySelectorAll("tspan")
      ?.forEach((tspan) => tspan.setAttribute("x", "0"));
    element.setAttribute("style", element.getAttribute("data-style")!);
    element.removeAttribute("data-style");
  });

  const blob = new Blob([string], { type: "image/svg+xml;charset=utf-8" });
  saveBlob(blob, filename);
}
