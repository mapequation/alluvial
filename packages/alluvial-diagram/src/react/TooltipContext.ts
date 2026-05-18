import { createContext, ReactNode, useContext } from "react";
import type { Module } from "../alluvial";

export type RenderTooltip = (props: {
  module: Module;
  fillColor: (group: { highlightIndex: number; insignificant: boolean }) => string;
  children: ReactNode;
}) => ReactNode;

export const RenderTooltipContext = createContext<RenderTooltip | undefined>(
  undefined
);

export function useRenderTooltip(): RenderTooltip | undefined {
  return useContext(RenderTooltipContext);
}
