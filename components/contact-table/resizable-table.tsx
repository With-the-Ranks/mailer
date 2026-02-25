"use client";

import { type ColumnDef, flexRender } from "@tanstack/react-table";
import * as React from "react";

import { EmptyState } from "@/components/empty-state";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ResizableTableProps<T> {
  table: any;
  data: T[];
  columns: ColumnDef<T>[];
}

export function ResizableTable<T>({
  table,
  data: _data,
  columns,
}: ResizableTableProps<T>) {
  const [columnSizing, _setColumnSizing] = React.useState<
    Record<string, number>
  >({});

  // Sync column sizing with table instance
  React.useEffect(() => {
    table.setColumnSizing(columnSizing);
  }, [columnSizing, table]);

  const rowCount = table.getRowModel().rows?.length ?? 0;
  const isEmpty = rowCount === 0;

  const tableMinHeight = "min-h-[20rem] sm:min-h-[30rem]";
  const tableWidth = isEmpty ? "100%" : table.getCenterTotalSize();

  return (
    <div
      className={cn(
        "relative overflow-x-auto overflow-y-hidden rounded-lg border bg-white dark:border-neutral-700 dark:bg-[#2D2D2D]",
        tableMinHeight,
      )}
    >
      <table
        style={{
          width: tableWidth,
          minWidth: isEmpty ? undefined : "100%",
        }}
        className={cn(
          "w-full caption-bottom bg-white text-base dark:bg-[#2D2D2D]",
        )}
      >
        <TableHeader>
          {table
            .getHeaderGroups()
            .map(
              (headerGroup: {
                id: React.Key | null | undefined;
                headers: any[];
              }) => (
                <TableRow key={headerGroup.id} className="dark:bg-[#252525]">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="relative whitespace-nowrap dark:text-gray-400"
                    >
                      {header.isPlaceholder ? null : (
                        <span className="whitespace-nowrap">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                      )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="bg-border hover:bg-primary/50 active:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none"
                          style={{
                            transform: header.column.getIsResizing()
                              ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
                              : "",
                          }}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ),
            )}
        </TableHeader>
        <TableBody>
          {rowCount ? (
            table
              .getRowModel()
              .rows.map(
                (row: {
                  id: React.Key | null | undefined;
                  getIsSelected: () => any;
                  getVisibleCells: () => any[];
                }) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
          ) : (
            <>
              <TableRow className="h-full [&>td]:border-0 [&>td]:p-0">
                <TableCell
                  colSpan={columns.length}
                  className="h-full min-h-68 w-full sm:min-h-108"
                  style={{ verticalAlign: "top" }}
                />
              </TableRow>
            </>
          )}
        </TableBody>
      </table>
      {isEmpty && (
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col items-center justify-center px-3 py-6 sm:px-4 sm:py-8"
          style={{ top: "3rem" }}
          aria-hidden
        >
          <div className="flex min-h-68 flex-1 flex-col items-center justify-center gap-3 text-center sm:min-h-108 sm:gap-4">
            <EmptyState
              icon="table-properties"
              message="No contacts in this list"
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}
