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
  const [formData, setFormData] = React.useState<
    Partial<CustomFieldDefinition>
  >({
    name: "",
    label: "",
    type: "text",
    required: false,
    description: "",
    options: [],
  });
  const [newOption, setNewOption] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      type: "text",
      required: false,
      description: "",
      options: [],
    });
    setEditingField(null);
    setNewOption("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedLabel = formData.label?.trim() || "";
    const normalizedName =
      formData.name?.trim() ||
      editingField?.name ||
      toInternalFieldName(normalizedLabel);

    if (!normalizedLabel) {
      toast.error("Display label is required");
      return;
    }

    if (!normalizedName) {
      toast.error("Unable to generate a valid internal name");
      return;
    }

    if (
      formData.type === "select" &&
      (!formData.options || !formData.options.length)
    ) {
      toast.error("Please add at least one dropdown option");
      return;
    }

    const payload = {
      name: normalizedName,
      label: normalizedLabel,
      type: formData.type || "text",
      required: formData.required || false,
      description: formData.description,
      options: formData.type === "select" ? formData.options : undefined,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(
        editingField
          ? `/api/custom-fields/${editingField.id}`
          : "/api/custom-fields",
        {
          method: editingField ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        toast.error(message);
        return;
      }

      const savedField = (await response.json()) as CustomFieldDefinition;
      if (editingField) {
        onCustomFieldsChange(
          customFields.map((field) =>
            field.id === editingField.id ? savedField : field,
          ),
        );
        toast.success("Custom field updated");
      } else {
        onCustomFieldsChange([...customFields, savedField]);
        toast.success("Custom field created");
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save custom field:", error);
      toast.error("Failed to save custom field");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setFormData(field);
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
      } catch (error) {
        console.error("Failed to delete custom field:", error);
        toast.error("Failed to delete custom field");
      }
    }
  };

  const addOption = () => {
    if (newOption && !formData.options?.includes(newOption)) {
      setFormData((prev) => ({
        ...prev,
        options: [...(prev.options || []), newOption],
      }));
      setNewOption("");
    }
  };

  const removeOption = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((opt) => opt !== option) || [],
    }));
  };

  const generatedName = React.useMemo(
    () => toInternalFieldName(formData.label || ""),
    [formData.label],
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
          {/* Existing Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Custom Fields</h3>
            {customFields.length === 0 ? (
              <p className="text-muted-foreground">
                No custom fields defined yet.
              </p>
            ) : (
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-base">
                        Field name: {field.name}
                        {field.description && ` • ${field.description}`}
                      </p>
                      {field.options && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {field.options.map((option) => (
                            <Badge
                              key={option}
                              variant="outline"
                              className="text-xs"
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

          <Separator />

          {/* Add/Edit Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {editingField ? "Edit" : "Add New"} Custom Field
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fieldLabel">Display Label *</Label>
                  <Input
                    id="fieldLabel"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    placeholder="e.g., Voter Status, Phone Preference"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    What users will see in records and forms.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Internal Name (Optional)</Label>
                  <Input
                    id="fieldName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={generatedName || "auto-generated from label"}
                  />
                  <p className="text-muted-foreground text-xs">
                    Auto-generated if left blank.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fieldType">Field Type</Label>
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          required: e.target.checked,
                        }))
                      }
                    />
                    Required Field
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Users must fill this field when adding contacts.
                  </p>
                </div>
              </div>

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
                          onClick={() => removeOption(option)}
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
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addOption())
                      }
                    />
                    <Button type="button" onClick={addOption} size="sm">
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {editingField ? "Update" : "Add"} Field
                </Button>
                {editingField && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
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
