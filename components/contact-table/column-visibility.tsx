import type { Table } from "@tanstack/react-table";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Contact } from "@/lib/types";

interface ColumnVisibilityProps {
  table: Table<Contact>;
}

const columnGroups = {
  Essential: ["select", "actions", "email", "firstName", "lastName"],
  "Contact Info": [
    "phone",
    "defaultAddressCompany",
    "defaultAddressCity",
    "defaultAddressCountryCode",
  ],
  "Address Details": [
    "defaultAddressAddress1",
    "defaultAddressAddress2",
    "defaultAddressProvinceCode",
    "defaultAddressZip",
    "defaultAddressPhone",
  ],
  "Organizing Data": ["tags", "customFields"],
  Additional: ["note"],
  Metadata: ["createdAt", "updatedAt"],
};

export function ColumnVisibility({ table }: ColumnVisibilityProps) {
  const getColumnDisplayName = (columnId: string) => {
    const displayNames: Record<string, string> = {
      select: "Select",
      actions: "Actions",
      email: "Email",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone",
      defaultAddressCompany: "Organization",
      defaultAddressCity: "City",
      defaultAddressCountryCode: "Country",
      defaultAddressAddress1: "Address",
      defaultAddressAddress2: "Address 2",
      defaultAddressProvinceCode: "State/Province",
      defaultAddressZip: "Zip Code",
      defaultAddressPhone: "Address Phone",
      tags: "Tags",
      note: "Note",
      customFields: "Custom Fields",
      createdAt: "Created",
      updatedAt: "Updated",
    };
    return displayNames[columnId] || columnId;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Columns
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-96 w-56 overflow-y-auto"
      >
        {Object.entries(columnGroups).map(([groupName, columnIds]) => (
          <div key={groupName}>
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-semibold uppercase tracking-wider">
              {groupName}
            </DropdownMenuLabel>
            {columnIds.map((columnId) => {
              const column = table.getColumn(columnId);
              if (!column?.getCanHide()) return null;

              return (
                <DropdownMenuCheckboxItem
                  key={columnId}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  className="pl-6"
                >
                  {getColumnDisplayName(columnId)}
                </DropdownMenuCheckboxItem>
              );
            })}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
