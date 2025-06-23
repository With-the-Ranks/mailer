"use client";

import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  TrashIcon,
} from "lucide-react";
import * as React from "react";

import { mockContacts } from "@/lib/mock-data";
import type { Contact } from "@/lib/types";

import { AddContactSheet } from "./contact-table/add-contact-sheet";
import { ColumnVisibility } from "./contact-table/column-visibility";
import { ResizableTable } from "./contact-table/resizable-table";
import { createColumns } from "./contact-table/table-columns";
import { type FilterState, TableFilters } from "./contact-table/table-filters";
import {
  type CustomFieldDefinition,
  CustomFieldsManager,
} from "./custom-fields-manager";
import { CsvImportDialog } from "./import/csv-import-dialog";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ContactListProps {
  listId: string;
  listName: string;
  initialContacts?: any[]; // Your Prisma audience data
}

// Helper function to convert Prisma audience data to Contact format
function convertAudienceToContact(audience: any): Contact {
  return {
    id: audience.id,
    email: audience.email,
    firstName: audience.firstName,
    lastName: audience.lastName,
    phone: audience.phone,
    note: audience.note,
    tags: audience.tags,
    defaultAddressCompany: audience.defaultAddressCompany,
    defaultAddressAddress1: audience.defaultAddressAddress1,
    defaultAddressAddress2: audience.defaultAddressAddress2,
    defaultAddressCity: audience.defaultAddressCity,
    defaultAddressProvinceCode: audience.defaultAddressProvinceCode,
    defaultAddressCountryCode: audience.defaultAddressCountryCode,
    defaultAddressZip: audience.defaultAddressZip,
    defaultAddressPhone: audience.defaultAddressPhone,
    customFields: audience.customFields || {},
    createdAt: audience.createdAt
      ? new Date(audience.createdAt).toISOString().split("T")[0]
      : undefined,
    updatedAt: audience.updatedAt
      ? new Date(audience.updatedAt).toISOString().split("T")[0]
      : undefined,
  };
}

export function ContactList({
  listId,
  listName,
  initialContacts,
}: ContactListProps) {
  // Convert initial data or use mock data
  const [contacts, setContacts] = React.useState<Contact[]>(() => {
    if (initialContacts && initialContacts.length > 0) {
      return initialContacts.map(convertAudienceToContact);
    }
    return mockContacts;
  });

  const [customFields, setCustomFields] = React.useState<
    CustomFieldDefinition[]
  >([
    {
      id: "1",
      name: "voterStatus",
      label: "Voter Status",
      type: "select",
      options: [
        "Registered",
        "Newly Registered",
        "Unregistered",
        "Moved",
        "Inactive",
      ],
      required: false,
      description: "Current voter registration status",
    },
    {
      id: "2",
      name: "precinct",
      label: "Precinct",
      type: "text",
      required: false,
      description: "Voting precinct identifier",
    },
    {
      id: "3",
      name: "priority",
      label: "Priority",
      type: "select",
      options: ["High", "Medium", "Low"],
      required: false,
      description: "Contact priority level",
    },
    {
      id: "4",
      name: "volunteerHours",
      label: "Volunteer Hours",
      type: "number",
      required: false,
      description: "Total volunteer hours contributed",
    },
    {
      id: "5",
      name: "profession",
      label: "Profession",
      type: "text",
      required: false,
      description: "Contact's profession or job title",
    },
  ]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      defaultAddressAddress2: false,
      defaultAddressPhone: false,
      defaultAddressProvinceCode: false,
      defaultAddressZip: false,
      note: false,
      createdAt: false,
      updatedAt: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<FilterState>({
    tags: [],
    countries: [],
    organizations: [],
    voterStatus: [],
    precincts: [],
    dateRange: "all",
  });

  const handleDeleteContact = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        // TODO: Add API call to delete from database
        // await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
        setContacts((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Failed to delete contact:", error);
        alert("Failed to delete contact. Please try again.");
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key as keyof typeof rowSelection],
    );
    if (
      selectedIds.length > 0 &&
      confirm(`Delete ${selectedIds.length} selected contacts?`)
    ) {
      try {
        // TODO: Add API call for bulk delete
        // await fetch('/api/contacts/bulk-delete', {
        //   method: 'POST',
        //   body: JSON.stringify({ ids: selectedIds })
        // })
        setContacts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        setRowSelection({});
      } catch (error) {
        console.error("Failed to delete contacts:", error);
        alert("Failed to delete contacts. Please try again.");
      }
    }
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    try {
      // TODO: Add API call to update in database
      // await fetch(`/api/contacts/${updatedContact.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(updatedContact)
      // })
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === updatedContact.id ? updatedContact : contact,
        ),
      );
    } catch (error) {
      console.error("Failed to update contact:", error);
      alert("Failed to update contact. Please try again.");
    }
  };

  const handleAddContact = async (newContact: Contact) => {
    try {
      // TODO: Add API call to save to database
      // const response = await fetch('/api/contacts', {
      //   method: 'POST',
      //   body: JSON.stringify({ ...newContact, audienceListId: listId })
      // })
      // const savedContact = await response.json()
      setContacts((prev) => [...prev, newContact]);
    } catch (error) {
      console.error("Failed to add contact:", error);
      alert("Failed to add contact. Please try again.");
    }
  };

  const handleImportComplete = async (importedContacts: Contact[]) => {
    try {
      // TODO: Add API call for bulk import
      // await fetch('/api/contacts/bulk-import', {
      //   method: 'POST',
      //   body: JSON.stringify({ contacts: importedContacts, audienceListId: listId })
      // })
      setContacts((prev) => [...prev, ...importedContacts]);
    } catch (error) {
      console.error("Failed to import contacts:", error);
      alert("Failed to import contacts. Please try again.");
    }
  };

  // Filter contacts based on search and active filters
  const filteredContacts = React.useMemo(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(
        (contact) =>
          contact.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          contact.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
          contact.defaultAddressCompany
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()),
      );
    }

    // Apply advanced filters
    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter((contact) =>
        contact.tags
          ?.split(",")
          .some((tag) => activeFilters.tags.includes(tag.trim())),
      );
    }

    if (activeFilters.countries.length > 0) {
      filtered = filtered.filter(
        (contact) =>
          contact.defaultAddressCountryCode &&
          activeFilters.countries.includes(contact.defaultAddressCountryCode),
      );
    }

    if (activeFilters.organizations.length > 0) {
      filtered = filtered.filter(
        (contact) =>
          contact.defaultAddressCompany &&
          activeFilters.organizations.includes(contact.defaultAddressCompany),
      );
    }

    if (activeFilters.voterStatus.length > 0) {
      filtered = filtered.filter(
        (contact) =>
          contact.customFields?.voterStatus &&
          activeFilters.voterStatus.includes(contact.customFields.voterStatus),
      );
    }

    if (activeFilters.precincts.length > 0) {
      filtered = filtered.filter(
        (contact) =>
          contact.customFields?.precinct &&
          activeFilters.precincts.includes(contact.customFields.precinct),
      );
    }

    // Apply date range filter
    if (activeFilters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (activeFilters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((contact) => {
        if (!contact.createdAt) return false;
        const createdDate = new Date(contact.createdAt);
        return createdDate >= filterDate;
      });
    }

    return filtered;
  }, [contacts, searchValue, activeFilters]);

  const columns = React.useMemo(
    () =>
      createColumns(
        customFields,
        async (_id: string, _data: Partial<Contact>) => {},
        handleDeleteContact,
        {
          onUpdateContact: handleUpdateContact,
          onDeleteContact: handleDeleteContact,
        },
      ),
    [customFields, handleDeleteContact, handleUpdateContact],
  );

  const table = useReactTable({
    data: filteredContacts,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex h-full w-full flex-col space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{listName}</h2>
          <p className="text-muted-foreground">
            Manage your contact list for organizing, campaigns, and outreach •{" "}
            {filteredContacts.length} contacts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CustomFieldsManager
            fields={customFields}
            onFieldsChange={setCustomFields}
          />
          <CsvImportDialog onImportComplete={handleImportComplete} />
          <AddContactSheet
            onAddContact={handleAddContact}
            customFields={customFields}
          />
        </div>
      </div>

      {/* Filters */}
      <TableFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        contacts={contacts}
        onFilterChange={setActiveFilters}
      />

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Object.keys(rowSelection).length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete ({Object.keys(rowSelection).length})
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <ColumnVisibility table={table} />
        </div>
      </div>

      {/* Resizable Table */}
      <ResizableTable table={table} data={filteredContacts} columns={columns} />

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {Object.keys(rowSelection).length} of {filteredContacts.length}{" "}
          contact(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                setPagination((prev) => ({ ...prev, pageSize: Number(value) }));
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
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pagination.pageIndex + 1} of{" "}
            {Math.ceil(filteredContacts.length / pagination.pageSize)}
          </div>
          <div className="flex items-center space-x-2">
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
                Math.ceil(filteredContacts.length / pagination.pageSize) - 1
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
                  pageIndex:
                    Math.ceil(filteredContacts.length / pagination.pageSize) -
                    1,
                }))
              }
              disabled={
                pagination.pageIndex >=
                Math.ceil(filteredContacts.length / pagination.pageSize) - 1
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
