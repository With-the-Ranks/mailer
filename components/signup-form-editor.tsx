"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Save, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface SignupFormField {
  id?: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string | null;
  options: string[];
  order: number;
}

interface SignupForm {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  audienceListId?: string | null;
  fields: SignupFormField[];
}

interface AudienceList {
  id: string;
  name: string;
}

interface SignupFormEditorProps {
  signupForm: SignupForm;
  audienceLists: AudienceList[];
  organizationId: string;
}

// Field types that match existing contact fields
const FIELD_TYPES = [
  { value: "email", label: "Email Address", required: true },
  { value: "firstName", label: "First Name", required: true },
  { value: "lastName", label: "Last Name", required: true },
  { value: "phone", label: "Phone Number", required: false },
  { value: "defaultAddressZip", label: "Zip Code", required: false },
  { value: "defaultAddressCity", label: "City", required: false },
  {
    value: "defaultAddressProvinceCode",
    label: "State/Province",
    required: false,
  },
  { value: "defaultAddressCountryCode", label: "Country", required: false },
  { value: "defaultAddressAddress1", label: "Street Address", required: false },
  { value: "defaultAddressAddress2", label: "Address Line 2", required: false },
  { value: "defaultAddressCompany", label: "Company", required: false },
  { value: "note", label: "Notes", required: false },
  { value: "tags", label: "Tags", required: false },
];

// Sortable Field Component
function SortableField({
  field,
  index,
  onUpdate,
  onRemove,
}: {
  field: SignupFormField;
  index: number;
  onUpdate: (index: number, updates: Partial<SignupFormField>) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id || `field-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fieldType = FIELD_TYPES.find((ft) => ft.value === field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`space-y-4 rounded-lg border p-4 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium">
            {fieldType?.label || field.label}
          </span>
          {field.required && <Badge variant="secondary">Required</Badge>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Field Label</Label>
          <Input
            value={field.label}
            onChange={(e) => onUpdate(index, { label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>
        <div>
          <Label>Field Type</Label>
          <Select
            value={field.type}
            onValueChange={(value) => {
              const fieldType = FIELD_TYPES.find((ft) => ft.value === value);
              onUpdate(index, {
                type: value,
                label: fieldType?.label || field.label,
                required: fieldType?.required || false,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Field Name</Label>
          <Input
            value={field.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            placeholder="field_name"
          />
        </div>
        <div>
          <Label>Placeholder</Label>
          <Input
            value={field.placeholder || ""}
            onChange={(e) => onUpdate(index, { placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id={`required-${index}`}
          checked={field.required}
          onCheckedChange={(checked) => onUpdate(index, { required: checked })}
        />
        <Label htmlFor={`required-${index}`}>Required field</Label>
      </div>
    </div>
  );
}

export default function SignupFormEditor({
  signupForm,
  audienceLists,
  organizationId,
}: SignupFormEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Find the master audience list (first one or create default)
  const masterAudienceList =
    audienceLists.find(
      (list) =>
        list.name.toLowerCase().includes("master") ||
        list.name.toLowerCase().includes("main") ||
        list.name.toLowerCase().includes("default"),
    ) || audienceLists[0];

  const [formData, setFormData] = useState({
    name: signupForm.name,
    slug: signupForm.slug,
    isActive: signupForm.isActive,
    audienceListId: masterAudienceList?.id || "",
  });
  const [fields, setFields] = useState<SignupFormField[]>(signupForm.fields);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addField = () => {
    const newField: SignupFormField = {
      id: `field_${Date.now()}`,
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
      options: [],
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<SignupFormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(
          (item) => (item.id || `field-${items.indexOf(item)}`) === active.id,
        );
        const newIndex = items.findIndex(
          (item) => (item.id || `field-${items.indexOf(item)}`) === over.id,
        );

        const newFields = arrayMove(items, oldIndex, newIndex);
        // Update order values
        newFields.forEach((field, index) => {
          field.order = index;
        });
        return newFields;
      });
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert("Please enter a form name");
      return;
    }

    if (!formData.slug.trim()) {
      alert("Please enter a form slug");
      return;
    }

    // Validate field names are unique
    const fieldNames = fields.map((f) => f.name.trim());
    const duplicateNames = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index,
    );

    if (duplicateNames.length > 0) {
      alert(`Duplicate field names found: ${duplicateNames.join(", ")}`);
      return;
    }

    // Validate required fields have names
    const emptyFieldNames = fields.filter((f) => !f.name.trim());
    if (emptyFieldNames.length > 0) {
      alert("All fields must have a name");
      return;
    }

    setIsSaving(true);
    try {
      // Update form data
      const formResponse = await fetch(`/api/signup-forms/${signupForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!formResponse.ok) {
        const errorData = await formResponse.json();
        throw new Error(errorData.error || "Failed to update form");
      }

      // Update fields
      const fieldsResponse = await fetch(
        `/api/signup-forms/${signupForm.id}/fields`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        },
      );

      if (!fieldsResponse.ok) {
        const errorData = await fieldsResponse.json();
        throw new Error(errorData.error || "Failed to update fields");
      }

      // Revalidate the page to show updated data
      router.refresh();
      router.push(`/organization/${organizationId}/signup-forms`);
    } catch (error) {
      console.error("Error saving signup form:", error);
      alert(
        `Error saving form: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Column - Form Fields */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Form Fields</span>
              <Button onClick={addField} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map(
                  (field, index) => field.id || `field-${index}`,
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <SortableField
                      key={field.id || `field-${index}`}
                      field={field}
                      index={index}
                      onUpdate={updateField}
                      onRemove={removeField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Form Settings */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Form Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Form Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter form name"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="form-slug"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Form is active</Label>
              </div>

              <div>
                <Label htmlFor="audienceList">Audience List</Label>
                <Input
                  value={masterAudienceList?.name || "Master List"}
                  disabled
                  className="bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Signup forms automatically use the master audience list
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Form"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
