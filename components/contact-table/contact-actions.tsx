"use client";

import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Contact } from "@/lib/types";

import { EditContactSheet } from "./edit-contact-sheet";
import { ViewContactSheet } from "./view-contact-sheet";

interface ContactActionsProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
  onDeleteContact?: (id: string) => void;
  viewOnly?: boolean;
}

export function ContactActions({
  contact,
  onUpdateContact,
  onDeleteContact,
  viewOnly = false,
}: ContactActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <ViewContactSheet contact={contact} />
      {!viewOnly && onUpdateContact && (
        <EditContactSheet contact={contact} onUpdateContact={onUpdateContact} />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(contact.email)}
          >
            Copy email
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(contact.phone || "")}
          >
            Copy phone
          </DropdownMenuItem>
          {!viewOnly && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteContact?.(contact.id)}
                className="text-red-600"
              >
                Delete contact
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
