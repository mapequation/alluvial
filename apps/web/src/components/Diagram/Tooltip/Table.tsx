import { Table as CkTable } from "@chakra-ui/react";
import type { Module } from "@mapequation/alluvial-diagram";

export function Table({
  module,
  numNodes,
}: {
  module: Module;
  numNodes: number;
}) {
  const totalNumNodes = module.parent?.numLeafNodes ?? 0;
  const fractionNodes = (100 * numNodes) / totalNumNodes;

  return (
    <CkTable.Root variant="outline" size="sm" mt={1}>
      <CkTable.Body>
        <CkTable.Row>
          <CkTable.Cell>Module</CkTable.Cell>
          <CkTable.Cell>{module.moduleId}</CkTable.Cell>
        </CkTable.Row>
        <CkTable.Row>
          <CkTable.Cell>Level</CkTable.Cell>
          <CkTable.Cell>
            {module.moduleLevel}
            {module.isTopModule
              ? " (top)"
              : module.isLeafModule
              ? " (leaf)"
              : ""}
          </CkTable.Cell>
        </CkTable.Row>
        <CkTable.Row>
          <CkTable.Cell>Flow</CkTable.Cell>
          <CkTable.Cell>{module.flow.toPrecision(3)}</CkTable.Cell>
        </CkTable.Row>
        <CkTable.Row>
          <CkTable.Cell>Leaf nodes</CkTable.Cell>
          <CkTable.Cell>
            {numNodes} ({fractionNodes.toFixed(1)}%)
          </CkTable.Cell>
        </CkTable.Row>
        <CkTable.Row>
          <CkTable.Cell>Sub-modules</CkTable.Cell>
          <CkTable.Cell>{module.hasSubmodules ? "Yes" : "No"}</CkTable.Cell>
        </CkTable.Row>
      </CkTable.Body>
    </CkTable.Root>
  );
}
