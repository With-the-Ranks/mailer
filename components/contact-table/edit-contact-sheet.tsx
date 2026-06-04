"use client";

import { EditIcon, PlusIcon, TagIcon, XIcon } from "lucide-react";
import * as React from "react";

import type { CustomFieldDefinition } from "@/components/custom-fields-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/types";

interface EditContactSheetProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
  customFields?: CustomFieldDefinition[];
  trigger?: React.ReactNode;
}

export function EditContactSheet({
  contact,
  onUpdateContact,
  customFields = [],
  trigger,
}: EditContactSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Contact>(contact);
  const [newTag, setNewTag] = React.useState("");

  React.useEffect(() => {
    setFormData(contact);
  }, [contact]);

  const definedFieldNames = React.useMemo(
    () => new Set(customFields.map((field) => field.name)),
    [customFields],
  );

  const legacyCustomFields = React.useMemo(
    () =>
      Object.entries(formData.customFields || {}).filter(
        ([key]) => !definedFieldNames.has(key),
      ),
    [formData.customFields, definedFieldNames],
  );

  const hasPrimaryContactInfo = () =>
    Boolean(
      formData.email?.trim() ||
      formData.phone?.trim() ||
      formData.firstName?.trim() ||
      formData.lastName?.trim(),
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPrimaryContactInfo()) {
      alert("Please enter at least a name, email, or phone number");
      return;
    }

    const updatedContact: Contact = {
      ...formData,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    onUpdateContact(updatedContact);
    setOpen(false);
  };

  const addTag = () => {
    if (newTag) {
      const currentTags = formData.tags
        ? formData.tags.split(",").map((t) => t.trim())
        : [];
      if (!currentTags.includes(newTag.trim())) {
        const updatedTags = [...currentTags, newTag.trim()].join(",");
        setFormData((prev) => ({ ...prev, tags: updatedTags }));
      }
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags
      ? formData.tags.split(",").map((t) => t.trim())
      : [];
    const updatedTags = currentTags
      .filter((tag) => tag !== tagToRemove)
      .join(",");
    setFormData((prev) => ({ ...prev, tags: updatedTags }));
  };

  const removeCustomField = (key: string) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.customFields || {};
      return { ...prev, customFields: rest };
    });
  };

  const setCustomFieldValue = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value,
      },
    }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <EditIcon className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex h-full w-[600px] flex-col p-0 sm:max-w-[600px]">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b px-6 pt-6 pb-4">
            <SheetTitle>Edit Contact</SheetTitle>
            <SheetDescription>
              Update contact information. Keep at least a name, email, or phone.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-4 px-6 py-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Address Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="company">Organization</Label>
                  <Input
                    id="company"
                    value={formData.defaultAddressCompany || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultAddressCompany: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={formData.defaultAddressAddress1 || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultAddressAddress1: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    value={formData.defaultAddressAddress2 || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultAddressAddress2: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.defaultAddressCity || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defaultAddressCity: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input
                      id="zip"
                      value={formData.defaultAddressZip || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defaultAddressZip: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="province">State/Province Code</Label>
                    <Input
                      id="province"
                      value={formData.defaultAddressProvinceCode || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defaultAddressProvinceCode: e.target.value,
                        }))
                      }
                      placeholder="e.g., CA, NY, TX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country Code</Label>
                    <Input
                      id="country"
                      value={formData.defaultAddressCountryCode || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defaultAddressCountryCode: e.target.value,
                        }))
                      }
                      placeholder="e.g., US, CA, GB"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressPhone">Address Phone</Label>
                  <Input
                    id="addressPhone"
                    value={formData.defaultAddressPhone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultAddressPhone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.tags &&
                    formData.tags.split(",").map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag.trim()}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag.trim())}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {customFields.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Custom Fields</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {customFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </Label>
                          {field.type === "select" ? (
                            <Select
                              value={formData.customFields?.[field.name] || ""}
                              onValueChange={(value) =>
                                setCustomFieldValue(field.name, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={`Select ${field.label.toLowerCase()}`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === "textarea" ? (
                            <Textarea
                              id={field.name}
                              value={formData.customFields?.[field.name] || ""}
                              onChange={(e) =>
                                setCustomFieldValue(field.name, e.target.value)
                              }
                              placeholder={field.description}
                              required={field.required}
                            />
                          ) : (
                            <Input
                              id={field.name}
                              type={
                                field.type === "number"
                                  ? "number"
                                  : field.type === "date"
                                    ? "date"
                                    : "text"
                              }
                              value={formData.customFields?.[field.name] || ""}
                              onChange={(e) =>
                                setCustomFieldValue(field.name, e.target.value)
                              }
                              placeholder={field.description}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      To add new field definitions, use the Custom Fields
                      manager.
                    </p>
                  </div>
                </>
              )}

              {legacyCustomFields.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">
                      Legacy Custom Fields
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      These values are not in the global custom-field
                      definitions.
                    </p>
                    <div className="space-y-2">
                      {legacyCustomFields.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 rounded-sm border p-2"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{key}:</span>{" "}
                            {String(value)}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomField(key)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Subscription Status</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isUnsubscribed"
                    checked={formData.isUnsubscribed || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isUnsubscribed: e.target.checked,
                        unsubscribedAt: e.target.checked
                          ? new Date().toISOString()
                          : undefined,
                      }))
                    }
                    className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isUnsubscribed" className="cursor-pointer">
                    Mark as unsubscribed
                  </Label>
                </div>
                {formData.isUnsubscribed && formData.unsubscribedAt && (
                  <p className="text-xs text-gray-500">
                    Unsubscribed on:{" "}
                    {new Date(formData.unsubscribedAt).toLocaleDateString()}
                  </p>
                )}
                {formData.isUnsubscribed && formData.unsubscribeReason && (
                  <p className="text-xs text-gray-500">
                    Reason: {formData.unsubscribeReason}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2 pb-2">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={formData.note || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, note: e.target.value }))
                    }
                    placeholder="Additional information about the contact..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row items-center justify-between border-t bg-white px-6 py-4 dark:bg-[#2D2D2D]">
            <p className="text-muted-foreground text-xs">
              Custom field changes are saved when you click Update Record.
            </p>
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Update Record</Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
