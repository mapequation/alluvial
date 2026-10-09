import { Checkbox } from "@chakra-ui/react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from "@tanstack/react-table";
import type { LeafNode } from "@mapequation/alluvial-diagram";
import Name from "./Name";
import Path from "./Path";

export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filterFns: { includesString: filterFn_includesString },
  sortFns,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, LeafNode>();

export const columns = columnHelper.columns([
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
]);
