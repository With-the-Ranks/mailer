"use client";

import { PlusIcon, SettingsIcon, TrashIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  fields: CustomFieldDefinition[];
  onFieldsChange: (fields: CustomFieldDefinition[]) => void;
}

export function CustomFieldsManager({
  fields,
  onFieldsChange,
}: CustomFieldsManagerProps) {
  const [open, setOpen] = React.useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.label) {
      alert("Please fill in required fields");
      return;
    }

    const fieldData: CustomFieldDefinition = {
      id: editingField?.id || Date.now().toString(),
      name: formData.name!,
      label: formData.label!,
      type: formData.type || "text",
      required: formData.required || false,
      description: formData.description,
      options: formData.type === "select" ? formData.options : undefined,
    };

    if (editingField) {
      onFieldsChange(
        fields.map((field) =>
          field.id === editingField.id ? fieldData : field,
        ),
      );
    } else {
      onFieldsChange([...fields, fieldData]);
    }

    resetForm();
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

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setFormData(field);
  };

  const handleDelete = (fieldId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this custom field? This will remove it from all contacts.",
      )
    ) {
      onFieldsChange(fields.filter((field) => field.id !== fieldId));
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="mr-2 h-4 w-4" />
          Manage Custom Fields
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Custom Fields Manager</DialogTitle>
          <DialogDescription>
            Create and manage custom fields for your contacts. These fields will
            be available when adding or editing contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-auto">
          {/* Existing Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Custom Fields</h3>
            {fields.length === 0 ? (
              <p className="text-muted-foreground">
                No custom fields defined yet.
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field) => (
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
                      <p className="text-muted-foreground text-sm">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Field Name *</Label>
                  <Input
                    id="fieldName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., voterStatus, phonePreference"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    Used internally. Use camelCase, no spaces or special
                    characters.
                  </p>
                </div>
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
                    What users will see in forms and tables.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldType">Field Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                <Button type="submit">
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
