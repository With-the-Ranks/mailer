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
}

export function EmailTable({
  emails,
  hidePagination = false,
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
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-neutral-700 dark:bg-[#2D2D2D]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-[#252525]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Email Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Time
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-[#2D2D2D]">
            {pageEmails.map((email) => (
              <EmailRow key={email.id} data={email} />
            ))}
          </tbody>
        </table>
      </div>

      {!hidePagination && emails.length > 0 && (
        <div className="flex flex-nowrap items-center justify-between gap-4 py-4">
          <div className="text-muted-foreground min-w-0 flex-1 shrink text-base">
            Showing {showingStart}–{showingEnd} of {emails.length} campaign
            {emails.length === 1 ? "" : "s"}
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-4 lg:gap-6">
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-base font-medium whitespace-nowrap">
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
            <div className="flex min-w-36 shrink-0 items-center justify-center text-base font-medium whitespace-nowrap">
              Page {pagination.pageIndex + 1} of {pageCount}
            </div>
            <div className="flex shrink-0 items-center gap-2">
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
