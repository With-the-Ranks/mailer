"use client";

import type { Audience } from "@prisma/client";
import {
  MoveHorizontalIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import CreateAudienceButton from "@/components/create-audience-button";
import AddAudienceModal from "@/components/modal/add-audience-modal";
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
  addCustomFieldToAudienceList,
  deleteAudience,
  getAudiences,
  removeCustomFieldFromAudienceList,
  updateAudience,
} from "@/lib/actions/audience-list";
import { isErrorResponse } from "@/lib/utils";

interface EmailListProps {
  audienceList: Audience[];
  audienceListId: string;
  listName: string;
}

export function EmailList({ audienceListId, listName }: EmailListProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch audiences and custom fields from the server
    const fetchAudiences = async () => {
      setIsLoading(true); // Start loading
      const response = await getAudiences(audienceListId);
      if (isErrorResponse(response)) {
        toast.error(response.error);
      } else {
        setAudiences(response.audiences);
        setCustomFields(response.customFields);
      }
      setIsLoading(false); // Stop loading
    };

    fetchAudiences();
  }, [audienceListId]);

  // Handle click for adding a new custom field
  const handleAddCustomFieldClick = async () => {
    if (customFields.length >= 3) {
      toast.error("You can only add up to 3 custom fields");
      return;
    }

    const newField = prompt("Enter custom field name:");
    if (!newField) return;

    // Call the server action to add the custom field to the audience list
    const response = await addCustomFieldToAudienceList(
      audienceListId,
      newField,
    );

    if (isErrorResponse(response)) {
      toast.error(response.error);
    } else {
      // Update local state with the new custom field
      setCustomFields((prev) => [...prev, newField]);
      toast.success(`Custom field "${newField}" added successfully.`);
    }
  };

  // Handle delete custom field
  const handleDeleteCustomField = async (fieldToDelete: string) => {
    const response = await removeCustomFieldFromAudienceList(
      audienceListId,
      fieldToDelete,
    );

    if (isErrorResponse(response)) {
      toast.error(response.error);
    } else {
      // Update local state by removing the deleted custom field
      setCustomFields((prev) =>
        prev.filter((field) => field !== fieldToDelete),
      );
      toast.success(`Custom field "${fieldToDelete}" removed successfully.`);
    }
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
        setAudiences(updatedAudiences.audiences);
        toast.success("Audience deleted successfully");
      }
    }
  };

  const handleSaveClick = async (index: number) => {
    const audience = audiences[index];

    const updatedData = {
      email: audience.email,
      firstName: audience.firstName,
      lastName: audience.lastName,
      customFields: audience.customFields,
    };

    const response = await updateAudience(audience.id, updatedData);
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
    field: keyof Audience | "customFields",
    value: string | Record<string, any>,
  ) => {
    const updatedAudiences = [...audiences];

    if (field === "customFields" && typeof value === "object") {
      // Handle custom fields as an object
      updatedAudiences[index].customFields = value;
    } else {
      // Handle core fields (email, firstName, etc.)
      updatedAudiences[index] = { ...updatedAudiences[index], [field]: value };
    }

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
            customFields: JSON.stringify(entry.customFields || {}), // Handle custom fields as JSON string
          }));

          for (const entry of newEntries) {
            const formData = new FormData();
            formData.append("email", entry.email);
            formData.append("firstName", entry.firstName);
            formData.append("lastName", entry.lastName);
            formData.append("audienceListId", audienceListId);
            formData.append("customFields", entry.customFields); // Add custom fields

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
        <h1 className="text-2xl font-bold">Audience List: {listName}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddCustomFieldClick}
            className="flex items-center justify-center space-x-2 rounded-lg border border-black px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-black hover:text-white active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Custom Field
          </button>
          <CreateAudienceButton>
            <AddAudienceModal audienceListId={audienceListId} />
          </CreateAudienceButton>
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
              {/* Loop through custom fields and add headers */}
              {customFields.map((field, index) => (
                <TableHead key={index} className="gap-4">
                  {field}
                  <button
                    onClick={() => handleDeleteCustomField(field)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Delete custom field ${field}`}
                  >
                    <TrashIcon className="h-4 w-4 pt-1" />
                  </button>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading state
              <>
                {[...Array(3)].map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="animate-pulse bg-gray-200">
                      &nbsp;
                    </TableCell>
                    <TableCell className="animate-pulse bg-gray-200">
                      &nbsp;
                    </TableCell>
                    <TableCell className="animate-pulse bg-gray-200">
                      &nbsp;
                    </TableCell>
                    <TableCell className="animate-pulse bg-gray-200">
                      &nbsp;
                    </TableCell>
                    {customFields.map((_, i) => (
                      <TableCell key={i} className="animate-pulse bg-gray-200">
                        &nbsp;
                      </TableCell>
                    ))}
                    <TableCell className="animate-pulse bg-gray-200">
                      &nbsp;
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : audiences.length > 0 ? (
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
                  {/* Render custom fields for each row */}
                  {customFields.map((field, i) => (
                    <TableCell key={i}>
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={
                            (audience.customFields as Record<string, any>)?.[
                              field
                            ] || ""
                          } // Cast customFields
                          onChange={(e) => {
                            const updatedAudience = { ...audience };
                            const updatedCustomFields = {
                              ...((audience.customFields as Record<
                                string,
                                any
                              >) || {}), // Handle null and cast to object
                              [field]: e.target.value,
                            };
                            updatedAudience.customFields = updatedCustomFields;
                            handleEditChange(
                              index,
                              "customFields",
                              updatedCustomFields,
                            );
                          }}
                          className="w-full rounded border p-2"
                        />
                      ) : (
                        (audience.customFields as Record<string, any>)?.[
                          field
                        ] || "" // Cast customFields
                      )}
                    </TableCell>
                  ))}
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
    </div>
  );
}
