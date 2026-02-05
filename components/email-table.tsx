"use client";

import type { Email, Organization } from "@/prisma/generated/prisma/client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import * as React from "react";

import EmailRow from "@/components/email-row";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EmailWithOrg = Email & { organization?: Organization | null };

interface EmailTableProps {
  emails: EmailWithOrg[];
  /** When true, hide pagination (e.g. for "Recent Emails" with a small limit) */
  hidePagination?: boolean;
  /** First column header (default: "Email Campaign"). Use "Name" for dashboard recent table. */
  firstColumnLabel?: string;
}

export function EmailTable({
  emails,
  hidePagination = false,
  firstColumnLabel = "Email Campaign",
}: EmailTableProps) {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const pageCount = Math.ceil(emails.length / pagination.pageSize) || 1;
  const start = pagination.pageIndex * pagination.pageSize;
  const pageEmails = emails.slice(start, start + pagination.pageSize);

  // Reset to page 0 when pageSize changes and current page would be out of range
  React.useEffect(() => {
    if (pagination.pageIndex >= pageCount && pageCount > 0) {
      setPagination((p) => ({ ...p, pageIndex: pageCount - 1 }));
    }
  }, [pagination.pageSize, pageCount, pagination.pageIndex]);

  const showingStart = emails.length === 0 ? 0 : start + 1;
  const showingEnd = Math.min(start + pagination.pageSize, emails.length);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px] sm:min-w-0">
        <table className="min-w-full table-fixed border-separate border-spacing-0">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[14%]" />
            <col className="w-[30%]" />
            <col className="w-[28%]" />
          </colgroup>
          <thead className="bg-transparent">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                {firstColumnLabel}
              </th>
              <th className="px-3 py-2 text-center text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Time
              </th>
              <th className="px-3 py-2 text-right text-xs font-bold tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
        </table>
        <div className="overflow-hidden rounded-lg border border-[#D3D3D3]">
          <table className="min-w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[14%]" />
              <col className="w-[30%]" />
              <col className="w-[28%]" />
            </colgroup>
            <tbody className="bg-white dark:bg-[#2D2D2D] [&>tr:first-child>td:first-child]:rounded-tl-lg [&>tr:first-child>td:last-child]:rounded-tr-lg [&>tr:last-child>td:first-child]:rounded-bl-lg [&>tr:last-child>td:last-child]:rounded-br-lg [&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-[#D3D3D3]">
              {pageEmails.map((email) => (
                <EmailRow key={email.id} data={email} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!hidePagination && emails.length > 0 && (
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between">
          <div className="text-muted-foreground order-1 shrink-0 text-sm sm:min-w-0 sm:flex-1 sm:text-base">
            Showing {showingStart}–{showingEnd} of {emails.length} campaign
            {emails.length === 1 ? "" : "s"}
          </div>
          <div className="order-2 flex flex-wrap items-center gap-3 sm:shrink-0 sm:gap-4 lg:gap-6">
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-sm font-medium whitespace-nowrap sm:text-base">
                Rows per page
              </p>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => {
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(value),
                    pageIndex: 0,
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
            <div className="flex shrink-0 items-center text-sm font-medium whitespace-nowrap sm:text-base">
              Page {pagination.pageIndex + 1} of {pageCount}
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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
                disabled={pagination.pageIndex >= pageCount - 1}
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
                    pageIndex: pageCount - 1,
                  }))
                }
                disabled={pagination.pageIndex >= pageCount - 1}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
