"use client";

import {
  CopyIcon,
  MoreHorizontalIcon,
  PhoneIcon,
  Trash2Icon,
} from "lucide-react";

import type { CustomFieldDefinition } from "@/components/custom-fields-manager";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Contact } from "@/lib/types";

import { EditContactSheet } from "./edit-contact-sheet";

interface ContactActionsProps {
  contact: Contact;
  onUpdateContact?: (contact: Contact) => void;
  onDeleteContact?: (id: string) => void;
  customFields?: CustomFieldDefinition[];
  viewOnly?: boolean;
}

export function ContactActions({
  contact,
  onUpdateContact,
  onDeleteContact,
  customFields = [],
  viewOnly = false,
}: ContactActionsProps) {
  const hasEmail = Boolean(contact.email?.trim());
  const hasPhone = Boolean(contact.phone?.trim());

  return (
    <div className="flex items-center justify-end gap-1 sm:gap-2">
      {!viewOnly && onUpdateContact && (
        <EditContactSheet
          contact={contact}
          onUpdateContact={onUpdateContact}
          customFields={customFields}
          trigger={
            <Button variant="default" size="sm">
              Edit
            </Button>
          }
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 rounded-md border border-[#D3D3D3] p-0 hover:bg-gray-50"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-lg border border-[#D3D3D3] bg-white p-1.5 dark:bg-[#2D2D2D] dark:text-white"
        >
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(contact.email || "")}
            disabled={!hasEmail}
            className="rounded-md px-3 py-2 text-sm"
          >
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy email
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(contact.phone || "")}
            disabled={!hasPhone}
            className="rounded-md px-3 py-2 text-sm"
          >
            <PhoneIcon className="mr-2 h-4 w-4" />
            Copy phone
          </DropdownMenuItem>
          {!viewOnly && (
            <DropdownMenuItem
              onClick={() => onDeleteContact?.(contact.id)}
              className="rounded-md px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              Delete contact
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
