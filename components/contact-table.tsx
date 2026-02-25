"use client";

import type { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contact } from "@/lib/types";

import { ResizableTable } from "./contact-table/resizable-table";

interface ContactTableProps {
  table: Table<Contact>;
  columns: any[];
  contacts: Contact[];
  pagination: { pageIndex: number; pageSize: number };
  setPagination: React.Dispatch<
    React.SetStateAction<{ pageIndex: number; pageSize: number }>
  >;
  selectedRowCount: number;
}

export function ContactTable({
  table,
  columns,
  contacts,
  pagination,
  setPagination,
  selectedRowCount,
}: ContactTableProps) {
  return (
    <div className="w-full min-w-0">
      <div className="w-full min-w-0 rounded-lg border">
        <ResizableTable table={table} data={contacts} columns={columns} />
      </div>

      <div className="flex flex-col gap-3 py-4 xl:flex-row xl:flex-nowrap xl:items-center xl:justify-between xl:gap-4">
        <div className="text-muted-foreground w-full text-sm md:text-base xl:min-w-0 xl:flex-1 xl:whitespace-nowrap">
          {selectedRowCount} of {contacts.length} contact(s) selected.
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-3 gap-y-2 xl:justify-end xl:gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap md:text-base">
              <span className="sm:hidden">Rows</span>
              <span className="hidden sm:inline">Rows per page</span>
            </span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                }));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap sm:text-base md:text-base">
              Page {pagination.pageIndex + 1} of{" "}
              {Math.max(1, Math.ceil(contacts.length / pagination.pageSize))}
            </span>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }
              disabled={pagination.pageIndex === 0}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              disabled={pagination.pageIndex === 0}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              disabled={
                pagination.pageIndex >=
                Math.ceil(contacts.length / pagination.pageSize) - 1
              }
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.max(
                    0,
                    Math.ceil(contacts.length / pagination.pageSize) - 1,
                  ),
                }))
              }
              disabled={
                pagination.pageIndex >=
                Math.ceil(contacts.length / pagination.pageSize) - 1
              }
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
