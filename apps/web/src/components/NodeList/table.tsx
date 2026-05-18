import { Checkbox } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import type { LeafNode } from "@mapequation/alluvial-diagram";
import Name from "./Name";
import Path from "./Path";

const columnHelper = createColumnHelper<LeafNode>();

export const columns = [
  columnHelper.display({
    id: "selection",
    header: ({ table }) => (
      <Checkbox.Root
        checked={
          table.getIsAllRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(details) =>
          table.toggleAllRowsSelected(details.checked === true)
        }
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ),
    cell: ({ row }) => (
      <Checkbox.Root
        checked={
          row.getIsSelected()
            ? true
            : row.getIsSomeSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(details) =>
          row.toggleSelected(details.checked === true)
        }
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Name",
    filterFn: "includesString",
    cell: (props) => (
      <Name
        name={props.getValue()}
        highlightIndex={props.row.original?.highlightIndex}
      />
    ),
  }),
  columnHelper.accessor("treePath", {
    header: "Path",
    cell: (props) => <Path path={props.getValue()} />,
  }),
  columnHelper.accessor("nodeId", { header: "Id" }),
  columnHelper.accessor("stateId", { header: "State Id" }),
  columnHelper.accessor("layerId", { header: "Layer" }),
  columnHelper.accessor("flow", {
    header: "Flow",
    cell: (props) => props.getValue().toPrecision(3),
  }),
];
