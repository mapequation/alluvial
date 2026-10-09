import { ButtonGroup, Flex, IconButton } from "@chakra-ui/react";
import type { ReactTable } from "@tanstack/react-table";
import type { LeafNode } from "@mapequation/alluvial-diagram";
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import type { features } from "./table";

export default function Pagination({
  instance,
}: {
  instance: ReactTable<typeof features, LeafNode>;
}) {
  return (
    <Flex align="center" mt={4}>
      <ButtonGroup attached mr={4} size="sm">
        <IconButton
          aria-label="Start"
          onClick={() => instance.setPageIndex(0)}
          disabled={!instance.getCanPreviousPage()}
        >
          <HiOutlineChevronDoubleLeft />
        </IconButton>
        <IconButton
          aria-label="Previous"
          onClick={() => instance.previousPage()}
          disabled={!instance.getCanPreviousPage()}
        >
          <HiOutlineChevronLeft />
        </IconButton>
        <IconButton
          aria-label="Next"
          onClick={() => instance.nextPage()}
          disabled={!instance.getCanNextPage()}
        >
          <HiOutlineChevronRight />
        </IconButton>
        <IconButton
          aria-label="End"
          onClick={() => instance.setPageIndex(instance.getPageCount() - 1)}
          disabled={!instance.getCanNextPage()}
        >
          <HiOutlineChevronDoubleRight />
        </IconButton>
      </ButtonGroup>
      Page {instance.state.pagination.pageIndex + 1} of{" "}
      {instance.getPageCount()}
    </Flex>
  );
}
