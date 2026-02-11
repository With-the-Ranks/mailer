"use client";

import { PlusIcon, TrashIcon, XIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required: boolean;
  description?: string;
}

interface CustomFieldsManagerProps {
  customFields: CustomFieldDefinition[];
  onCustomFieldsChange: (fields: CustomFieldDefinition[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const defaultFormData: Partial<CustomFieldDefinition> = {
  name: "",
  label: "",
  type: "text",
  required: false,
  description: "",
  options: [],
};

export function CustomFieldsManager({
  customFields = [],
  onCustomFieldsChange,
  open: controlledOpen,
  onOpenChange,
}: CustomFieldsManagerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Prefer controlled mode if open prop is present
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [editingField, setEditingField] =
    React.useState<CustomFieldDefinition | null>(null);

  const [addFormData, setAddFormData] = React.useState<
    Partial<CustomFieldDefinition>
  >({ ...defaultFormData });
  const [editFormData, setEditFormData] = React.useState<
    Partial<CustomFieldDefinition>
  >({ ...defaultFormData });

  const [newAddOption, setNewAddOption] = React.useState("");
  const [newEditOption, setNewEditOption] = React.useState("");

  const [isCreating, setIsCreating] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const toInternalFieldName = (value: string) => {
    const words = value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) return "";

    return words
      .map((word, index) => {
        const normalized = word.toLowerCase();
        if (index === 0) return normalized;
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
      })
      .join("");
  };

  const parseErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();
      if (data?.error) return data.error as string;
    } catch {
      // Ignore JSON parse errors and use fallback message
    }
    return "Something went wrong. Please try again.";
  };

  const resetAddForm = () => {
    setAddFormData({ ...defaultFormData });
    setNewAddOption("");
  };

  const resetEditForm = () => {
    setEditingField(null);
    setEditFormData({ ...defaultFormData });
    setNewEditOption("");
  };

  const buildPayload = (
    formData: Partial<CustomFieldDefinition>,
    existingName?: string,
  ) => {
    const normalizedLabel = formData.label?.trim() || "";
    const normalizedName = existingName || toInternalFieldName(normalizedLabel);

    if (!normalizedLabel) {
      toast.error("Field name is required");
      return null;
    }

    if (!normalizedName) {
      toast.error("Unable to generate a valid internal name");
      return null;
    }

    if (
      formData.type === "select" &&
      (!formData.options || !formData.options.length)
    ) {
      toast.error("Please add at least one dropdown option");
      return null;
    }

    return {
      name: normalizedName,
      label: normalizedLabel,
      type: formData.type || "text",
      required: formData.required || false,
      description: formData.description,
      options: formData.type === "select" ? formData.options : undefined,
    };
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload(addFormData);
    if (!payload) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        toast.error(message);
        return;
      }

      const savedField = (await response.json()) as CustomFieldDefinition;
      onCustomFieldsChange([...customFields, savedField]);
      toast.success("Custom field created");
      resetAddForm();
    } catch (error) {
      console.error("Failed to save custom field:", error);
      toast.error("Failed to save custom field");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;

    const payload = buildPayload(editFormData, editingField.name);
    if (!payload) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/custom-fields/${editingField.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        toast.error(message);
        return;
      }

      const savedField = (await response.json()) as CustomFieldDefinition;
      onCustomFieldsChange(
        customFields.map((field) =>
          field.id === editingField.id ? savedField : field,
        ),
      );
      toast.success("Custom field updated");
      resetEditForm();
    } catch (error) {
      console.error("Failed to update custom field:", error);
      toast.error("Failed to update custom field");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setEditFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      description: field.description,
      options: field.options || [],
    });
    setNewEditOption("");
  };

  const handleDelete = async (fieldId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this custom field? This will remove it from all contacts.",
      )
    ) {
      try {
        const response = await fetch(`/api/custom-fields/${fieldId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const message = await parseErrorMessage(response);
          toast.error(message);
          return;
        }
        onCustomFieldsChange(
          customFields.filter((field) => field.id !== fieldId),
        );
        toast.success("Custom field deleted");
        if (editingField?.id === fieldId) {
          resetEditForm();
        }
      } catch (error) {
        console.error("Failed to delete custom field:", error);
        toast.error("Failed to delete custom field");
      }
    }
  };

  const addSelectOption = (
    value: string,
    setValue: (value: string) => void,
    setFormData: React.Dispatch<
      React.SetStateAction<Partial<CustomFieldDefinition>>
    >,
    formData: Partial<CustomFieldDefinition>,
  ) => {
    if (value && !formData.options?.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        options: [...(prev.options || []), value],
      }));
      setValue("");
    }
  };

  const removeSelectOption = (
    option: string,
    setFormData: React.Dispatch<
      React.SetStateAction<Partial<CustomFieldDefinition>>
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((opt) => opt !== option) || [],
    }));
  };

  const renderFieldTypeAndRequired = (
    idPrefix: string,
    formData: Partial<CustomFieldDefinition>,
    setFormData: React.Dispatch<
      React.SetStateAction<Partial<CustomFieldDefinition>>
    >,
  ) => (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-fieldType`}>Field Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: any) =>
            setFormData((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="h-11 rounded-lg border-[#D3D3D3] bg-white focus:ring-blue-500 dark:bg-[#2D2D2D]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg border border-[#D3D3D3] bg-white p-1.5 dark:bg-[#2D2D2D]">
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="select">Dropdown</SelectItem>
            <SelectItem value="textarea">Long Text</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-[#D3D3D3] p-3 dark:border-[#4A4A4A]">
        <input
          id={`${idPrefix}-required`}
          type="checkbox"
          checked={formData.required}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              required: e.target.checked,
            }))
          }
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-required`} className="cursor-pointer">
            Required Field
          </Label>
          <p className="text-muted-foreground text-xs">
            Users must fill this field when adding contacts.
          </p>
        </div>
      </div>
    </div>
  );

  const renderDescriptionAndOptions = (
    formData: Partial<CustomFieldDefinition>,
    setFormData: React.Dispatch<
      React.SetStateAction<Partial<CustomFieldDefinition>>
    >,
    newOption: string,
    setNewOption: (value: string) => void,
  ) => (
    <>
      <div className="space-y-2">
        <Label htmlFor="fieldDescription">Description (Optional)</Label>
        <Textarea
          id="fieldDescription"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          placeholder="Brief description of what this field is for..."
          rows={2}
        />
      </div>

      {formData.type === "select" && (
        <div className="space-y-2">
          <Label>Dropdown Options</Label>
          <div className="mb-2 flex flex-wrap gap-2">
            {formData.options?.map((option) => (
              <Badge
                key={option}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeSelectOption(option, setFormData)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(),
                addSelectOption(newOption, setNewOption, setFormData, formData))
              }
            />
            <Button
              type="button"
              onClick={() =>
                addSelectOption(newOption, setNewOption, setFormData, formData)
              }
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Custom Fields Manager</DialogTitle>
          <DialogDescription>
            Create and manage custom fields for your contacts. These fields will
            be available when adding or editing contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-auto p-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Existing Custom Fields</h3>
              <Badge variant="outline" className="text-xs">
                {customFields.length}
              </Badge>
            </div>
            {customFields.length === 0 ? (
              <p className="text-muted-foreground">
                No custom fields defined yet.
              </p>
            ) : (
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="group flex items-center justify-between rounded-xl border border-[#CFCFCF] bg-white px-3 py-3 shadow-xs transition hover:shadow-sm dark:border-[#4A4A4A] dark:bg-[#252525]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">
                          {field.label}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs uppercase dark:border-[#5A5A5A]"
                        >
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          >
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Key</span>
                        <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
                          {field.name}
                        </code>
                      </div>
                      {field.description && (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {field.description}
                        </p>
                      )}
                      {field.options && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {field.options.map((option) => (
                            <Badge
                              key={option}
                              variant="outline"
                              className="bg-white text-xs dark:bg-[#2D2D2D]"
                            >
                              {option}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-semibold"
                        onClick={() => handleEdit(field)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(field.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editingField && (
            <>
              <Separator />
              <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                <div>
                  <h3 className="text-lg font-medium">Edit Custom Field</h3>
                  <p className="text-muted-foreground text-xs">
                    Editing{" "}
                    <span className="font-semibold">{editingField.label}</span>.
                    Changes apply when you click Update Field.
                  </p>
                </div>

                <form onSubmit={handleUpdateField} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFieldName">Field Name *</Label>
                    <Input
                      id="editFieldName"
                      value={editFormData.label}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      required
                    />
                    <p className="text-muted-foreground text-xs">
                      Display name only. Internal key remains unchanged.
                    </p>
                  </div>

                  {renderFieldTypeAndRequired(
                    "edit",
                    editFormData,
                    setEditFormData,
                  )}
                  {renderDescriptionAndOptions(
                    editFormData,
                    setEditFormData,
                    newEditOption,
                    setNewEditOption,
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isUpdating}>
                      Update Field
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetEditForm}
                    >
                      Cancel Edit
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}

          {!editingField && (
            <>
              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Add New Custom Field</h3>
                <form onSubmit={handleCreateField} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="addFieldName">Field Name *</Label>
                    <Input
                      id="addFieldName"
                      value={addFormData.label}
                      onChange={(e) =>
                        setAddFormData((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      placeholder="e.g., Voter Status, Phone Preference"
                      required
                    />
                    <p className="text-muted-foreground text-xs">
                      Used as the display name. Internal key is generated
                      automatically.
                    </p>
                  </div>

                  {renderFieldTypeAndRequired(
                    "add",
                    addFormData,
                    setAddFormData,
                  )}
                  {renderDescriptionAndOptions(
                    addFormData,
                    setAddFormData,
                    newAddOption,
                    setNewAddOption,
                  )}

                  <Button type="submit" disabled={isCreating}>
                    Add Field
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
