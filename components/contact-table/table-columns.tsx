"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Contact } from "@/lib/types";

import type { CustomFieldDefinition } from "../custom-fields-manager";
import { ContactActions } from "./contact-actions";

interface CreateColumnsProps {
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

export function createColumns(
  customFields: CustomFieldDefinition[],
  handleEditContact: (
    id: string,
    contactData: Partial<Contact>,
  ) => Promise<void>,
  handleDeleteContact: (id: string) => Promise<void>,
  { onUpdateContact, onDeleteContact }: CreateColumnsProps,
): ColumnDef<Contact>[] {
  return [
    {
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
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ContactActions
          contact={row.original}
          onUpdateContact={onUpdateContact}
          onDeleteContact={onDeleteContact}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 120,
    },
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
      size: 100,
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
      size: 120,
    },
    {
      accessorKey: "defaultAddressZip",
      header: "Zip Code",
      cell: ({ row }) => row.getValue("defaultAddressZip") || "—",
      size: 100,
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
      accessorKey: "customFields",
      header: "Custom Fields",
      cell: ({ row }) => {
        const customFields = row.getValue("customFields") as Record<
          string,
          any
        >;
        if (!customFields || Object.keys(customFields).length === 0) return "—";
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(customFields)
              .slice(0, 2)
              .map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            {Object.keys(customFields).length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{Object.keys(customFields).length - 2}
              </Badge>
            )}
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return date ? new Date(date).toLocaleDateString() : "—";
      },
      size: 100,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
        return date ? new Date(date).toLocaleDateString() : "—";
      },
      size: 100,
    },
  ];
}
