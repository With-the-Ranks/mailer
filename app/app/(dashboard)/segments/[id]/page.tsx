"use client";

import type { SortingState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ContactTable } from "@/components/contact-table";
import { createColumns } from "@/components/contact-table/table-columns";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/types";

export default function SegmentContactsPage() {
  const { id } = useParams() as { id: string };
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [segment, setSegment] = useState<any>(null);

  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    let isActive = true;

    async function fetchSegmentAndContacts() {
      try {
        const segRes = await fetch(`/api/segments/${id}`);
        if (!segRes.ok) throw new Error("Failed to fetch segment");
        const seg = await segRes.json();
        if (!isActive) return;

        setSegment(seg);

        if (!seg.audienceList?.id) {
          setContacts([]);
          return;
        }

        const contactsRes = await fetch("/api/contacts/by-segment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audienceListId: seg.audienceList.id,
            filterCriteria: seg.filterCriteria,
          }),
        });
        if (!contactsRes.ok) throw new Error("Failed to fetch contacts");
        const contactsData = await contactsRes.json();
        if (!isActive) return;
        setContacts(contactsData);
      } catch (err: any) {
        if (!isActive) return;
        toast.error(err.message || "Failed to load segment contacts");
        setContacts([]); // fallback to empty
      }
    }

    fetchSegmentAndContacts();
    return () => {
      isActive = false;
    };
  }, [id]);

  // columns and table
  const columns = useMemo(
    () =>
      createColumns({
        onUpdateContact: () => {},
        onDeleteContact: () => {},
        viewOnly: true,
      }),
    [],
  );

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      pagination,
      rowSelection,
      sorting,
    },
  });

  const selectedRowCount = Object.keys(rowSelection).filter(
    (key) => (rowSelection as any)[key],
  ).length;

  return (
    <div className="flex h-full w-full max-w-screen-2xl flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold">
            Segment{segment?.name ? `: ${segment.name}` : ""}
          </h2>
          <p className="text-muted-foreground">
            {contacts.length} contact(s) in audience list{" "}
            <span className="font-semibold">
              {segment?.audienceList?.name || ""}
            </span>
          </p>
        </div>
        <Link href={`/organization/${segment?.organizationId}/segments`}>
          <Button variant="outline">← Back to Segments</Button>
        </Link>
      </div>

      <ContactTable
        table={table}
        columns={columns}
        contacts={contacts}
        pagination={pagination}
        setPagination={setPagination}
        selectedRowCount={selectedRowCount}
      />
    </div>
  );
}
