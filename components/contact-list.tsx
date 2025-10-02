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
  Settings2Icon,
  TrashIcon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import type { Contact } from "@/lib/types";

import { ContactTable } from "./contact-table";
import { AddContactSheet } from "./contact-table/add-contact-sheet";
import { ColumnVisibility } from "./contact-table/column-visibility";
import { createColumns } from "./contact-table/table-columns";
import { TableFilters } from "./contact-table/table-filters";
import {
  type CustomFieldDefinition,
  CustomFieldsManager,
} from "./custom-fields-manager";
import { CsvImportDialog } from "./import/csv-import-dialog";
import { CreateSegmentDialog } from "./segments/create-segment-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface ContactListProps {
  listId: string;
  listName: string;
  initialContacts?: any[];
}

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
      ? new Date(audience.createdAt).toISOString()
      : undefined,
    updatedAt: audience.updatedAt
      ? new Date(audience.updatedAt).toISOString()
      : undefined,
    audienceListId: audience.audienceListId,
    isUnsubscribed: audience.isUnsubscribed || false,
    unsubscribedAt: audience.unsubscribedAt
      ? new Date(audience.unsubscribedAt).toISOString()
      : undefined,
    unsubscribeReason: audience.unsubscribeReason,
  };
}

// Helper function to safely parse JSON responses
async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || "Unknown error occurred");
  }
}

export function ContactList({
  listId,
  listName,
  initialContacts,
}: ContactListProps) {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [customFields, setCustomFields] = React.useState<
    CustomFieldDefinition[]
  >([]);
  const [rowSelection, setRowSelection] = React.useState({});
  // Load column visibility from localStorage
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      if (typeof window !== "undefined") {
        // Temporarily clear localStorage to test new defaults
        localStorage.removeItem(`contact-table-visibility-${listId}`);

        const saved = localStorage.getItem(
          `contact-table-visibility-${listId}`,
        );
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            // If parsing fails, use default visibility
          }
        }
      }
      // Default visibility - show all columns
      return {
        select: true,
        actions: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        defaultAddressCompany: true,
        defaultAddressCity: true,
        defaultAddressCountryCode: true,
        defaultAddressAddress1: true,
        defaultAddressAddress2: true,
        defaultAddressProvinceCode: true,
        defaultAddressZip: true,
        defaultAddressPhone: true,
        tags: true,
        note: true,
        customFields: true,
        createdAt: true,
        updatedAt: true,
      };
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true }, // Sort by creation date, latest first
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>(
    {},
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [contactToDelete, setContactToDelete] = React.useState<string | null>(
    null,
  );
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get("action");

  const handleActionChange = (key: string, open: boolean) => {
    // Add or remove action param
    const params = new URLSearchParams(searchParams);
    if (open) {
      params.set("action", key);
    } else {
      params.delete("action");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  // Initialize contacts from props, but always refresh from API to get latest data
  React.useEffect(() => {
    if (initialContacts && initialContacts.length > 0 && !isInitialized) {
      setContacts(initialContacts.map(convertAudienceToContact));
      setIsInitialized(true);
      // Refresh from API to get latest data (including unsubscribe status)
      loadContacts();
    } else if (!initialContacts || initialContacts.length === 0) {
      loadContacts();
    }
  }, [initialContacts, isInitialized, listId]);

  // Load custom fields
  React.useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      const response = await fetch("/api/custom-fields");
      if (response.ok) {
        const fields = await parseResponse(response);
        setCustomFields(fields);
      }
    } catch (error) {
      console.error("Failed to load custom fields:", error);
      toast.error("Failed to load custom fields");
    }
  };

  const loadContacts = async () => {
    try {
      const response = await fetch(`/api/contacts?audienceListId=${listId}`);
      if (response.ok) {
        const data = await parseResponse(response);
        setContacts(data.map(convertAudienceToContact));
      } else {
        const error = await parseResponse(response);
        toast.error(error.error || "Failed to load contacts");
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
      toast.error("Failed to load contacts");
    }
  };
  const handleAddContact = React.useCallback(
    async (contactData: Omit<Contact, "id">) => {
      try {
        const response = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...contactData,
            audienceListId: listId,
          }),
        });

        if (response.ok) {
          const newContact = await parseResponse(response);
          setContacts((prev) => [
            convertAudienceToContact(newContact),
            ...prev,
          ]);
          toast.success("Contact added successfully");
        } else {
          const error = await parseResponse(response);
          if (error.details) {
            const fieldErrors = error.details
              .map((d: any) => `${d.field}: ${d.message}`)
              .join(", ");
            toast.error(`Validation error: ${fieldErrors}`);
          } else {
            toast.error(error.error || "Failed to add contact");
          }
        }
      } catch (error) {
        console.error("Failed to add contact:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to add contact",
        );
      }
    },
    [listId],
  );

  const handleEditContact = React.useCallback(
    async (id: string, contactData: Partial<Contact>) => {
      const currentContact = contacts.find((c) => c.id === id);
      const payload = {
        ...contactData,
        audienceListId:
          (contactData as any).audienceListId ||
          currentContact?.audienceListId ||
          listId,
      };
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedContact = await parseResponse(response);
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === id
                ? convertAudienceToContact(updatedContact)
                : contact,
            ),
          );
          // Refresh from API to ensure we have the latest data
          await loadContacts();
          toast.success("Contact updated successfully");
        } else {
          const error = await parseResponse(response);
          if (error.details) {
            const fieldErrors = error.details
              .map((d: any) => `${d.field}: ${d.message}`)
              .join(", ");
            toast.error(`Validation error: ${fieldErrors}`);
          } else {
            toast.error(error.error || "Failed to update contact");
          }
        }
      } catch (error) {
        console.error("Failed to update contact:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update contact",
        );
      }
    },
    [contacts, listId],
  );

  const handleDeleteContact = React.useCallback(async (id: string) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      const response = await fetch(`/api/contacts/${contactToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContacts((prev) =>
          prev.filter((contact) => contact.id !== contactToDelete),
        );
        toast.success("Contact deleted successfully");
      } else {
        const error = await parseResponse(response);
        toast.error(error.error || "Failed to delete contact");
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete contact",
      );
    } finally {
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteDialogOpen(true);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleUpdateContact = (contact: Contact) => {
    handleEditContact(contact.id, contact);
  };
  const customFieldKeys = React.useMemo(() => {
    const keys = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.customFields) {
        Object.keys(contact.customFields).forEach((key) => keys.add(key));
      }
    });
    return Array.from(keys);
  }, [contacts]);
  const columns = React.useMemo(() => {
    const realColumns = createColumns({
      onUpdateContact: handleUpdateContact,
      onDeleteContact: handleDeleteContact,
    });

    const hiddenCustomFieldColumns = customFieldKeys.map((key) => ({
      id: key,
      header: key,
      accessorFn: (row: Contact) => row.customFields?.[key] ?? "",
      cell: ({ getValue }: any) => getValue() || "—",
      size: 120,
      enableHiding: true,
      enableSorting: false,
    }));

    return [...realColumns, ...hiddenCustomFieldColumns];
  }, [handleUpdateContact, handleDeleteContact, customFieldKeys]);

  // Create filter functions for each custom field key
  const filterFns = React.useMemo(() => {
    const obj: Record<string, any> = {};
    customFieldKeys.forEach((key) => {
      obj[key] = (row: any, columnId: string, filterValue: string[]) => {
        if (!filterValue || filterValue.length === 0) return true;
        const value = row.original.customFields?.[key];
        return filterValue.includes(value);
      };
    });
    return obj;
  }, [customFieldKeys]);
  const table = useReactTable({
    data: contacts,
    columns,
    filterFns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // Save column visibility to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `contact-table-visibility-${listId}`,
        JSON.stringify(columnVisibility),
      );
    }
  }, [columnVisibility, listId]);

  const confirmBulkDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    if (selectedIds.length === 0) {
      toast.error("No contacts selected");
      return;
    }

    try {
      const response = await fetch("/api/contacts/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response.ok) {
        const result = await parseResponse(response);
        setContacts((prev) =>
          prev.filter((contact) => !selectedIds.includes(contact.id)),
        );
        setRowSelection({});
        toast.success(`${result.deletedCount} contacts deleted successfully`);
      } else {
        const error = await parseResponse(response);
        toast.error(error.error || "Failed to delete contacts");
      }
    } catch (error) {
      console.error("Failed to bulk delete contacts:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete contacts",
      );
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleImportContacts = React.useCallback(
    async (importedContacts: Contact[]) => {
      try {
        const response = await fetch("/api/contacts/bulk-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts: importedContacts,
            audienceListId: listId,
            skipDuplicates: true,
          }),
        });

        if (response.ok) {
          const result = await parseResponse(response);
          await loadContacts();
          toast.success(
            `Import completed: ${result.results.successful} added, ${result.results.skipped} skipped, ${result.results.failed} failed`,
          );
        } else {
          const error = await parseResponse(response);
          toast.error(error.error || "Failed to import contacts");
        }
      } catch (error) {
        console.error("Failed to import contacts:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to import contacts",
        );
      }
    },
    [listId],
  );

  const selectedRowCount = Object.keys(rowSelection).filter(
    (key) => (rowSelection as any)[key],
  ).length;
  const filteredContacts = table
    .getFilteredRowModel()
    .rows.map((row) => row.original);
  const hasActiveFilters =
    !!searchValue ||
    Object.values(activeFilters).some((v) =>
      Array.isArray(v) ? v.length > 0 : !!v,
    );

  return (
    <div className="flex h-full max-w-screen-2xl flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{listName}</h2>
          <p className="text-muted-foreground">
            Manage your contact list for organizing, campaigns, and outreach •{" "}
            {contacts.length} contacts
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="?action=custom-fields" scroll={false}>
            <Button variant="outline" size="sm">
              <Settings2Icon className="mr-2 h-4 w-4" />
              Custom Fields
            </Button>
          </Link>
          <Link href="?action=import" scroll={false}>
            <Button variant="outline" size="sm">
              <UploadIcon className="mr-2 h-4 w-4" />
              Import Contacts
            </Button>
          </Link>
          <Link href="?action=add-contact" scroll={false}>
            <Button variant="default" size="sm">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </Link>
        </div>
        <CustomFieldsManager
          open={action === "custom-fields"}
          onOpenChange={(open) => handleActionChange("custom-fields", open)}
          customFields={customFields}
          onCustomFieldsChange={setCustomFields}
        />
        <CsvImportDialog
          audienceListId={listId}
          onImportComplete={handleImportContacts}
          open={action === "import"}
          onOpenChange={(open) => handleActionChange("import", open)}
        />
        <AddContactSheet
          open={action === "add-contact"}
          onOpenChange={(open) => handleActionChange("add-contact", open)}
          customFields={customFields}
          onAddContact={handleAddContact}
        />
        {hasActiveFilters && (
          <CreateSegmentDialog
            listId={listId}
            filteredContacts={filteredContacts}
            activeFilters={activeFilters}
            searchValue={searchValue}
            onSegmentCreated={() => {
              // Optionally reload your segments list here
            }}
          />
        )}
      </div>

      <TableFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        contacts={contacts}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        table={table}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ColumnVisibility table={table} customFields={customFieldKeys} />
          {selectedRowCount > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete ({selectedRowCount})
            </Button>
          )}
        </div>
        <div className="text-muted-foreground text-sm">
          {selectedRowCount > 0 &&
            `${selectedRowCount} of ${contacts.length} row(s) selected`}
        </div>
      </div>

      <ContactTable
        table={table}
        columns={columns}
        contacts={contacts}
        pagination={pagination}
        setPagination={setPagination}
        selectedRowCount={selectedRowCount}
      />
      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteContact}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Contacts</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRowCount} selected
              contact(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedRowCount} Contact(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
