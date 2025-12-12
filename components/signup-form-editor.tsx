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
import {
  Copy,
  ExternalLink,
  GripVertical,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmbedCodeDialog } from "@/components/embed-code-dialog";
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
  allFields,
}: {
  field: SignupFormField;
  index: number;
  onUpdate: (index: number, updates: Partial<SignupFormField>) => void;
  onRemove: (index: number) => void;
  allFields: SignupFormField[];
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

  // Get available field types (excluding already used types, except for the current field)
  const usedTypes = allFields
    .filter((_, i) => i !== index) // Exclude current field from used types
    .map((f) => f.type);

  const availableTypes = FIELD_TYPES.filter(
    (type) => !usedTypes.includes(type.value),
  );

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
          <span className="text-base font-medium">
            {fieldType?.label || field.label}
          </span>
          {field.required && <Badge variant="secondary">Required</Badge>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          disabled={field.type === "email"}
          title={
            field.type === "email"
              ? "Email field cannot be removed"
              : "Remove field"
          }
        >
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
                name: value, // Update field name to match the type
                label: fieldType?.label || field.label,
                placeholder: `Enter your ${(fieldType?.label || field.label).toLowerCase()}`,
                required: fieldType?.required || false,
              });
            }}
            disabled={field.type === "email"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.type === "email" && (
            <p className="mt-1 text-xs text-gray-500">
              Email field type cannot be changed
            </p>
          )}
          {availableTypes.length === 1 &&
            availableTypes[0].value === field.type && (
              <p className="mt-1 text-xs text-gray-500">
                All other field types are already used
              </p>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
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
          disabled={field.type === "email"}
        />
        <Label htmlFor={`required-${index}`}>
          Required field
          {field.type === "email" && (
            <span className="ml-1 text-xs text-gray-500">
              (always required)
            </span>
          )}
        </Label>
      </div>
    </div>
  );
}

export default function SignupFormEditor({
  signupForm,
  audienceLists,
  organizationId,
}: SignupFormEditorProps) {
  const _router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  // Get base URL on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

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
  // Ensure there's always an email field
  const ensureEmailField = (currentFields: SignupFormField[]) => {
    const hasEmailField = currentFields.some((field) => field.type === "email");
    if (!hasEmailField) {
      const emailField: SignupFormField = {
        id: "email-field",
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "Enter your email address",
        options: [],
        order: 0,
      };
      return [
        emailField,
        ...currentFields.map((field, index) => ({
          ...field,
          order: index + 1,
        })),
      ];
    }
    return currentFields;
  };

  const [fields, setFields] = useState<SignupFormField[]>(
    ensureEmailField(signupForm.fields),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addField = () => {
    // Find the first available field type that's not already used
    const usedTypes = fields.map((f) => f.type);
    const availableType = FIELD_TYPES.find(
      (type) => !usedTypes.includes(type.value),
    );

    if (!availableType) {
      alert("All field types are already used in this form.");
      return;
    }

    const newField: SignupFormField = {
      id: `field_${Date.now()}`,
      name: availableType.value,
      label: availableType.label,
      type: availableType.value,
      required: availableType.required || false,
      placeholder: `Enter your ${availableType.label.toLowerCase()}`,
      options: [],
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    const fieldToRemove = fields[index];

    // Prevent removing email fields
    if (fieldToRemove.type === "email") {
      alert("Email field cannot be removed as it's required for signup forms.");
      return;
    }

    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<SignupFormField>) => {
    const newFields = [...fields];
    const currentField = newFields[index];

    // Prevent changing email field type
    if (
      currentField.type === "email" &&
      updates.type &&
      updates.type !== "email"
    ) {
      alert("Email field type cannot be changed.");
      return;
    }

    // Ensure email fields are always required
    if (updates.type === "email" || currentField.type === "email") {
      updates.required = true;
    }

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

      // Use window.location for a full page refresh to ensure data is updated
      window.location.href = `/organization/${organizationId}/signup-forms`;
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
              <Button
                onClick={addField}
                size="sm"
                disabled={fields.length >= FIELD_TYPES.length}
                title={
                  fields.length >= FIELD_TYPES.length
                    ? "All field types are already used"
                    : "Add new field"
                }
              >
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
                      allFields={fields}
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

              {formData.isActive && (
                <div className="space-y-4 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                  <div>
                    <Label className="text-sm font-semibold">
                      Public Form Link
                    </Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        value={
                          baseUrl
                            ? `${baseUrl}/app/signup-forms/${formData.slug}`
                            : ""
                        }
                        readOnly
                        className="bg-white text-sm dark:bg-gray-800"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `${baseUrl}/app/signup-forms/${formData.slug}`;
                          window.open(url, "_blank");
                        }}
                        title="Open signup form in new tab"
                        disabled={!baseUrl}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const url = `${baseUrl}/app/signup-forms/${formData.slug}`;
                          try {
                            await navigator.clipboard.writeText(url);
                            toast.success("Link copied to clipboard!");
                          } catch {
                            const textArea = document.createElement("textarea");
                            textArea.value = url;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand("copy");
                            document.body.removeChild(textArea);
                            toast.success("Link copied to clipboard!");
                          }
                        }}
                        title="Copy link to clipboard"
                        disabled={!baseUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Share this link to collect signups
                    </p>
                  </div>

                  <div className="border-t pt-4 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">
                          Embed Code
                        </Label>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Get code to embed this form on your website
                        </p>
                      </div>
                      <EmbedCodeDialog
                        formSlug={formData.slug}
                        formName={formData.name}
                      />
                    </div>
                  </div>
                </div>
              )}

              {!formData.isActive && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Activate this form to get the public link and embed code.
                  </p>
                </div>
              )}
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
                  onClick={() => {
                    window.history.back();
                  }}
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
