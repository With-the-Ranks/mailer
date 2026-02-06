"use client";

import { type ColumnDef, flexRender } from "@tanstack/react-table";
import * as React from "react";

import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div
      className={`overflow-auto rounded-lg border bg-white dark:border-neutral-700 dark:bg-[#2D2D2D] ${isEmpty ? "min-h-128" : ""}`}
    >
      <Table
        style={{ width: table.getCenterTotalSize() }}
        className="bg-white dark:bg-[#2D2D2D]"
      >
        <TableHeader>
          {table
            .getHeaderGroups()
            .map(
              (headerGroup: {
                id: React.Key | null | undefined;
                headers: any[];
              }) => (
                <TableRow
                  key={headerGroup.id}
                  className="dark:bg-neutral-800/50"
                >
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
            <TableRow>
              <TableCell colSpan={columns.length} className="w-full align-top">
                <div className="flex min-h-120 max-w-1/2 flex-col items-center justify-center gap-4 px-8 py-12">
                  <EmptyState
                    icon="table-properties"
                    message="No contacts in this list"
                    compact
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
