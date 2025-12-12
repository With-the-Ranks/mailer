"use client";

import { type ColumnDef, flexRender } from "@tanstack/react-table";
import * as React from "react";

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
  data,
  columns,
}: ResizableTableProps<T>) {
  const [columnSizing, setColumnSizing] = React.useState<
    Record<string, number>
  >({});

  // Sync column sizing with table instance
  React.useEffect(() => {
    table.setColumnSizing(columnSizing);
  }, [columnSizing, table]);

  return (
    <div className="overflow-auto rounded-md border">
      <Table style={{ width: table.getCenterTotalSize() }}>
        <TableHeader>
          {table
            .getHeaderGroups()
            .map(
              (headerGroup: {
                id: React.Key | null | undefined;
                headers: any[];
              }) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="relative"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
          {table.getRowModel().rows?.length ? (
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No contacts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
