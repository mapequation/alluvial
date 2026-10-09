import {
  Button,
  Checkbox,
  Flex,
  Input,
  Table as CkTable,
} from "@chakra-ui/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import FileSaver from "file-saver";
import { observer } from "mobx-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import type { LeafNode } from "@mapequation/alluvial-diagram";
import useDebounce from "../../hooks/useDebounce";
import { StoreContext } from "../../store";
import ColorSchemeSelect from "../Sidebar/ColorSchemeSelect";
import Swatch from "../Sidebar/Swatch";
import { useColorModeValue } from "../ui/color-mode";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toaster } from "../ui/toaster";
import Pagination from "./Pagination";
import { columns } from "./table";

export default observer(function NodeList({
  onClose,
}: {
  onClose: () => void;
}) {
  const store = useContext(StoreContext);
  const bg = useColorModeValue("white", "gray.700");
  const [includeInsignificant, setIncludeInsignificant] = useState(true);
  const { selectedModule, defaultHighlightColor } = store;

  const data = useMemo(
    () => selectedModule?.getLeafNodes() ?? [],
    [selectedModule]
  );

  const [pagination, onPaginationChange] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [sorting, onSortingChange] = useState<SortingState>([
    { id: "flow", desc: true },
  ]);

  const [rowSelection, onRowSelectionChange] = useState<RowSelectionState>({});

  const [columnVisibility, onColumnVisibilityChange] =
    useState<VisibilityState>(() => {
      const state: VisibilityState = {};
      if (data.length === 0) return state;
      const first = data[0];
      if (first.stateId == null) state["stateId"] = false;
      if (first.layerId == null) state["layerId"] = false;
      return state;
    });

  const instance = useReactTable<LeafNode>({
    data,
    columns,
    state: { pagination, sorting, rowSelection, columnVisibility },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 100);

  const nameColumn = useMemo(() => instance.getColumn("name"), [instance]);

  useEffect(
    () => nameColumn?.setFilterValue(debouncedSearch),
    [nameColumn, debouncedSearch]
  );

  if (selectedModule == null) {
    onClose();
    return null;
  }

  const getNames = () => {
    const leafNodes = !includeInsignificant
      ? data.filter((node) => !node.insignificant)
      : data;
    return leafNodes.map((node) => node.name).join("\n");
  };

  const getSelectedNodes = () =>
    instance
      .getSelectedRowModel()
      .flatRows.filter((row) => row.original != null)
      .map((row) => row.original) as LeafNode[];

  const downloadNames = () => {
    const names = getNames();
    FileSaver.saveAs(
      new Blob([names], { type: "text/plain;charset=utf-8" }),
      `${selectedModule.networkName}-module-${selectedModule.moduleId}.txt`
    );
  };

  const copyNames = async () => {
    if (!navigator.clipboard) return;
    const names = getNames();
    await navigator.clipboard.writeText(names);
    toaster.create({
      type: "success",
      description: "Names copied to clipboard",
    });
  };

  const numericColumns = ["nodeId", "stateId", "layerId", "flow"];
  const noNodesSelected = instance.getSelectedRowModel().flatRows.length === 0;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{"Module " + selectedModule.moduleId}</DialogTitle>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody minH="35em">
        <Input
          placeholder="Search names..."
          maxW="50%"
          autoFocus
          tabIndex={0}
          onFocus={() => store.setEditMode(true)}
          onBlur={() => store.setEditMode(false)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CkTable.Root variant="outline" size="sm" colorPalette="gray" mt={4}>
          <CkTable.Header bg={bg}>
            {instance.getHeaderGroups().map((headerGroup) => (
              <CkTable.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <CkTable.ColumnHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    textAlign={
                      numericColumns.includes(header.id) ? "end" : undefined
                    }
                  >
                    {!header.isPlaceholder && (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <LuChevronUp />,
                          desc: <LuChevronDown />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </span>
                    )}
                  </CkTable.ColumnHeader>
                ))}
              </CkTable.Row>
            ))}
          </CkTable.Header>
          <CkTable.Body className={`table-update-${store.updateFlag}`}>
            {instance.getRowModel().rows.map((row) => (
              <CkTable.Row key={row.id} w="100%">
                {row.getVisibleCells().map((cell) => (
                  <CkTable.Cell
                    key={cell.id}
                    textAlign={
                      numericColumns.includes(cell.column.id)
                        ? "end"
                        : undefined
                    }
                    css={{
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      maxWidth: "25em",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </CkTable.Cell>
                ))}
              </CkTable.Row>
            ))}
          </CkTable.Body>
        </CkTable.Root>
        <Pagination instance={instance} />

        <ColorSchemeSelect w="300px" mt={4} />

        <Flex
          mt={4}
          gap={1}
          wrap="wrap"
          pointerEvents={noNodesSelected ? "none" : undefined}
          filter={noNodesSelected ? "grayscale(80%)" : undefined}
        >
          <Swatch
            color={defaultHighlightColor}
            onClick={() =>
              store.colorSelectedNodes(
                getSelectedNodes(),
                defaultHighlightColor
              )
            }
          />
          {store.selectedScheme.slice(0, 21).map((schemeColor, i) => (
            <Swatch
              key={`${i}-${schemeColor}`}
              color={schemeColor}
              onClick={() =>
                store.colorSelectedNodes(getSelectedNodes(), schemeColor)
              }
            />
          ))}
        </Flex>
      </DialogBody>
      <DialogFooter>
        <Button mr={2} onClick={downloadNames}>
          Download names
        </Button>
        {navigator.clipboard != null && (
          <Button mr={2} onClick={copyNames}>
            Copy names to clipboard
          </Button>
        )}
        <Checkbox.Root
          checked={includeInsignificant}
          onCheckedChange={(details) =>
            setIncludeInsignificant(details.checked === true)
          }
          mr="auto"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>Include insignificant</Checkbox.Label>
        </Checkbox.Root>
        <Button data-active="" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
});
