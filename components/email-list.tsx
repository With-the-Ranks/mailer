"use client";

import type { Audience } from "@prisma/client";
import { MoveHorizontalIcon, PlusIcon, UploadIcon } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
import {
  addAudience,
  deleteAudience,
  getAudiences,
  updateAudience,
} from "@/lib/actions/audience-list";
import { isErrorResponse } from "@/lib/utils";

import { AddAudienceModal } from "./add-audience-modal";

interface EmailListProps {
  audienceList: Audience[];
  audienceListId: string;
}

export function EmailList({ audienceList, audienceListId }: EmailListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [audiences, setAudiences] = useState<Audience[]>(audienceList);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAudiences(audienceList);
  }, [audienceList]);

  const handleAddEntryClick = () => {
    setIsModalOpen(true);
  };

  const handleDeleteEntryClick = async (audienceId: string) => {
    const response = await deleteAudience(audienceId);
    if (isErrorResponse(response)) {
      toast.error(response.error);
    } else {
      const updatedAudiences = await getAudiences(audienceListId);
      if (isErrorResponse(updatedAudiences)) {
        toast.error(updatedAudiences.error);
      } else {
        setAudiences(updatedAudiences);
        toast.success("Audience deleted successfully");
      }
    }
  };

  const handleSaveClick = async (index: number) => {
    const audience = audiences[index];
    const response = await updateAudience(audience.id, {
      email: audience.email,
      firstName: audience.firstName,
      lastName: audience.lastName,
    });
    if (isErrorResponse(response)) {
      toast.error(response.error);
    } else {
      const updatedAudiences = [...audiences];
      updatedAudiences[index] = response as Audience;
      setAudiences(updatedAudiences);
      setEditIndex(null);
      toast.success("Audience updated successfully");
    }
  };

  const handleEditChange = (
    index: number,
    field: keyof Audience,
    value: string,
  ) => {
    const updatedAudiences = [...audiences];
    updatedAudiences[index] = { ...updatedAudiences[index], [field]: value };
    setAudiences(updatedAudiences);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const newEntries = results.data.map((entry: any) => ({
            email: entry.email,
            firstName: entry.firstName,
            lastName: entry.lastName,
            audienceListId: audienceListId,
          }));

          for (const entry of newEntries) {
            const formData = new FormData();
            formData.append("email", entry.email);
            formData.append("firstName", entry.firstName);
            formData.append("lastName", entry.lastName);
            formData.append("audienceListId", audienceListId);

            const response = await addAudience(formData);
            if (isErrorResponse(response)) {
              toast.error(`Failed to add: ${entry.email}`);
            } else {
              setAudiences((prev) => [...prev, response as Audience]);
            }
          }

          toast.success("Entries imported successfully");
        },
        error: (error) => {
          toast.error("Failed to process CSV file");
          console.error(error);
        },
      });
    }
  };

  const handleImportEntriesClick = () => {
    fileInputRef.current?.click();
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
          <Button variant="custom" onClick={handleImportEntriesClick}>
            <UploadIcon className="mr-2 h-4 w-4" />
            Import Entries
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
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
            {audiences.length > 0 ? (
              audiences.map((audience, index) => (
                <TableRow key={audience.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {editIndex === index ? (
                      <input
                        type="email"
                        value={audience.email}
                        onChange={(e) =>
                          handleEditChange(index, "email", e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />
                    ) : (
                      audience.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={audience.firstName}
                        onChange={(e) =>
                          handleEditChange(index, "firstName", e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />
                    ) : (
                      audience.firstName
                    )}
                  </TableCell>
                  <TableCell>
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={audience.lastName}
                        onChange={(e) =>
                          handleEditChange(index, "lastName", e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />
                    ) : (
                      audience.lastName
                    )}
                  </TableCell>
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
                        {editIndex === index ? (
                          <DropdownMenuItem
                            onClick={() => handleSaveClick(index)}
                          >
                            Save
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setEditIndex(index)}>
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteEntryClick(audience.id)}
                        >
                          Delete
                        </DropdownMenuItem>
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
