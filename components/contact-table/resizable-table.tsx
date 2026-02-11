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
  onRowClick?: (row: T) => void;
}

export function ResizableTable<T>({
  table,
  data: _data,
  columns,
  onRowClick,
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
  const hasRowClick = Boolean(onRowClick);
  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[role='menuitem']") ||
      target.closest("[role='checkbox']") ||
      target.closest("[data-no-row-click='true']"),
    );
  };

  const tableMinHeight = "min-h-[20rem] sm:min-h-[30rem]";
  const tableBodyMinHeight = "min-h-[17rem] sm:min-h-[27rem]";
  const tableWidth = isEmpty ? "100%" : table.getCenterTotalSize();
  const tableStyle = {
    width: tableWidth,
    minWidth: isEmpty ? undefined : "100%",
  } as const;

  return (
    <div
      className={cn(
        "relative overflow-x-auto overflow-y-hidden",
        tableMinHeight,
      )}
    >
      <table
        style={tableStyle}
        className={cn(
          "w-full table-fixed caption-bottom bg-transparent text-base",
        )}
      >
        <TableHeader className="bg-transparent [&_tr]:border-b-0">
          {table
            .getHeaderGroups()
            .map(
              (headerGroup: {
                id: React.Key | null | undefined;
                headers: any[];
              }) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-0 bg-transparent hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        "relative overflow-hidden py-2 text-left text-xs font-bold tracking-wider whitespace-nowrap uppercase sm:py-3 dark:text-white [&_button]:h-auto [&_button]:max-w-full [&_button]:overflow-hidden [&_button]:px-0 [&_button]:py-0 [&_button]:text-xs [&_button]:font-bold [&_button]:tracking-wider [&_button]:uppercase [&_button:hover]:bg-transparent",
                        header.column.id === "select"
                          ? "px-2 sm:px-3"
                          : header.column.id === "actions"
                            ? "px-2 sm:px-3"
                            : "px-3 sm:px-6",
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <span
                          className="block max-w-full truncate whitespace-nowrap"
                          title={
                            typeof header.column.columnDef.header === "string"
                              ? header.column.columnDef.header
                              : undefined
                          }
                        >
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
      </table>
      <div
        style={tableStyle}
        className={cn(
          "relative overflow-hidden rounded-lg bg-white shadow-[inset_0_0_0_1px_#D3D3D3] dark:bg-[#2D2D2D] dark:shadow-[inset_0_0_0_1px_#4A4A4A]",
          tableBodyMinHeight,
        )}
      >
        <table
          style={tableStyle}
          className={cn(
            "w-full table-fixed caption-bottom bg-transparent text-base",
          )}
        >
          <TableBody className="bg-transparent">
            {rowCount ? (
              table
                .getRowModel()
                .rows.map(
                  (row: {
                    id: React.Key | null | undefined;
                    getIsSelected: () => any;
                    original: T;
                    getVisibleCells: () => any[];
                  }) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      role={hasRowClick ? "button" : undefined}
                      tabIndex={hasRowClick ? 0 : undefined}
                      className={cn(
                        "border-b border-[#D3D3D3] dark:border-[#4A4A4A] [&>td]:border-b [&>td]:border-[#D3D3D3] [&>td]:transition-colors hover:[&>td]:border-[#D3D3D3] hover:[&>td]:bg-gray-50 hover:[&>td]:shadow-[inset_0_1px_0_0_#D3D3D3,inset_0_-1px_0_0_#D3D3D3] dark:[&>td]:border-[#4A4A4A] dark:hover:[&>td]:border-[#4A4A4A] dark:hover:[&>td]:bg-neutral-800 dark:hover:[&>td]:shadow-[inset_0_1px_0_0_#4A4A4A,inset_0_-1px_0_0_#4A4A4A] hover:[&>td:first-child]:shadow-[inset_1px_0_0_0_#D3D3D3,inset_0_1px_0_0_#D3D3D3,inset_0_-1px_0_0_#D3D3D3] dark:hover:[&>td:first-child]:shadow-[inset_1px_0_0_0_#4A4A4A,inset_0_1px_0_0_#4A4A4A,inset_0_-1px_0_0_#4A4A4A] hover:[&>td:last-child]:shadow-[inset_-1px_0_0_0_#D3D3D3,inset_0_1px_0_0_#D3D3D3,inset_0_-1px_0_0_#D3D3D3] dark:hover:[&>td:last-child]:shadow-[inset_-1px_0_0_0_#4A4A4A,inset_0_1px_0_0_#4A4A4A,inset_0_-1px_0_0_#4A4A4A]",
                        hasRowClick && "cursor-pointer",
                      )}
                      onClick={(event) => {
                        if (!onRowClick) return;
                        if (isInteractiveTarget(event.target)) return;
                        onRowClick(row.original);
                      }}
                      onKeyDown={(event) => {
                        if (!onRowClick) return;
                        if (isInteractiveTarget(event.target)) return;
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        onRowClick(row.original);
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className={cn(
                            "py-3 sm:py-4",
                            cell.column.id === "select"
                              ? "px-2 sm:px-3"
                              : cell.column.id === "actions"
                                ? "px-2 sm:px-3"
                                : "px-3 sm:px-6",
                          )}
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
              <TableRow className="[&>td]:border-0 [&>td]:p-0">
                <TableCell
                  colSpan={columns.length}
                  className="h-[17rem] w-full sm:h-[27rem]"
                  style={{ verticalAlign: "top" }}
                />
              </TableRow>
            )}
          </TableBody>
        </table>

        {isEmpty && (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 py-6 sm:px-4 sm:py-8"
            aria-hidden
          >
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center sm:gap-4">
              <EmptyState
                icon="table-properties"
                message="No contacts in this list"
                compact
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
