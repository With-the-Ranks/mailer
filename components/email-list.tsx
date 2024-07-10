"use client";

import type { Audience } from "@prisma/client";
import { MoveHorizontalIcon, PlusIcon, UploadIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AddAudienceModal } from "./add-audience-modal";

interface EmailListProps {
  audienceList: Audience[];
  audienceListId: string;
}

export function EmailList({ audienceList, audienceListId }: EmailListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEntryClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Email List</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleAddEntryClick}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
          <Button variant="custom">
            <UploadIcon className="mr-2 h-4 w-4" />
            Import Entries
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead className="w-[100px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audienceList.length > 0 ? (
              audienceList.map((audience, index) => (
                <TableRow key={audience.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{audience.email}</TableCell>
                  <TableCell>{audience.firstName}</TableCell>
                  <TableCell>{audience.lastName}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoveHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No email entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {isModalOpen && (
        <AddAudienceModal
          closeModal={() => setIsModalOpen(false)}
          audienceListId={audienceListId}
        />
      )}
    </div>
  );
}
