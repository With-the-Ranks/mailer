"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Contact } from "@/lib/types";

import { ContactActions } from "./contact-actions";

interface CreateColumnsProps {
  onUpdateContact?: (contact: Contact) => void;
  onDeleteContact?: (id: string) => void;
  viewOnly?: boolean;
}

// Reusable filter for multi-select string fields (e.g., tags, org, country, etc.)
function multiSelectFilter(row: any, columnId: string, filterValue: string[]) {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  const raw = row.getValue(columnId);
  if (!raw) return false;

  if (columnId === "tags") {
    const tags = (raw as string).split(",").map((t) => t.trim());
    return filterValue.some((val) => tags.includes(val));
  }
  return filterValue.includes(raw);
}

function _customFieldsFilter(
  row: any,
  columnId: string,
  filterValue: string[],
) {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  const customFields = row.getValue(columnId) as Record<string, any>;
  if (!customFields) return false;
  return filterValue.some((val) => Object.values(customFields).includes(val));
}

export function createColumns({
  onUpdateContact,
  onDeleteContact,
  viewOnly = false,
}: CreateColumnsProps): ColumnDef<Contact>[] {
  const columns: ColumnDef<Contact>[] = [];

  if (!viewOnly) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 50,
    });
  }

  columns.push({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ContactActions
        contact={row.original}
        onUpdateContact={onUpdateContact}
        onDeleteContact={onDeleteContact}
        viewOnly={viewOnly}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 120,
  });

  columns.push(
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-blue-600">{row.getValue("email")}</div>
      ),
      size: 250,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      size: 150,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      size: 150,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.getValue("phone") || "—",
      size: 150,
    },
    {
      accessorKey: "defaultAddressCompany",
      header: "Organization",
      cell: ({ row }) => row.getValue("defaultAddressCompany") || "—",
      filterFn: multiSelectFilter,
      size: 200,
    },
    {
      accessorKey: "defaultAddressCity",
      header: "City",
      cell: ({ row }) => row.getValue("defaultAddressCity") || "—",
      size: 120,
    },
    {
      accessorKey: "defaultAddressCountryCode",
      header: "Country",
      cell: ({ row }) => {
        const country = row.getValue("defaultAddressCountryCode") as string;
        return country ? (
          <Badge variant="outline" className="font-mono">
            {country}
          </Badge>
        ) : (
          "—"
        );
      },
      filterFn: multiSelectFilter,
      size: 180,
    },
    {
      accessorKey: "isUnsubscribed",
      header: "Status",
      cell: ({ row }) => {
        const isUnsubscribed = row.getValue("isUnsubscribed") as boolean;
        return isUnsubscribed ? (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
          >
            Unsubscribed
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            Subscribed
          </Badge>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const isUnsubscribed = row.getValue(columnId) as boolean;
        return filterValue.includes(
          isUnsubscribed ? "unsubscribed" : "subscribed",
        );
      },
      size: 120,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string;
        if (!tags) return "—";
        return (
          <div className="flex flex-wrap gap-1">
            {tags
              .split(",")
              .slice(0, 2)
              .map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            {tags.split(",").length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.split(",").length - 2}
              </Badge>
            )}
          </div>
        );
      },
      filterFn: multiSelectFilter,
      size: 200,
    },
    {
      accessorKey: "defaultAddressAddress1",
      header: "Address",
      cell: ({ row }) => row.getValue("defaultAddressAddress1") || "—",
      size: 200,
    },
    {
      accessorKey: "defaultAddressAddress2",
      header: "Address 2",
      cell: ({ row }) => row.getValue("defaultAddressAddress2") || "—",
      size: 150,
    },
    {
      accessorKey: "defaultAddressProvinceCode",
      header: "State/Province",
      cell: ({ row }) => {
        const province = row.getValue("defaultAddressProvinceCode") as string;
        return province ? (
          <Badge variant="outline" className="font-mono">
            {province}
          </Badge>
        ) : (
          "—"
        );
      },
      filterFn: multiSelectFilter,
      size: 120,
    },
    {
      accessorKey: "defaultAddressZip",
      header: "Zip Code",
      cell: ({ row }) => row.getValue("defaultAddressZip") || "—",
      filterFn: multiSelectFilter,
      size: 180,
    },
    {
      accessorKey: "defaultAddressPhone",
      header: "Address Phone",
      cell: ({ row }) => row.getValue("defaultAddressPhone") || "—",
      size: 150,
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => {
        const note = row.getValue("note") as string;
        return note ? (
          <div className="max-w-32 truncate" title={note}>
            {note}
          </div>
        ) : (
          "—"
        );
      },
      size: 200,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return date
          ? new Date(date).toLocaleDateString() +
              " " +
              new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
          : "—";
      },
      size: 180,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
        return date
          ? new Date(date).toLocaleDateString() +
              " " +
              new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
          : "—";
      },
      size: 180,
    },
  );

  return columns;
}
