"use client";

import { PlusIcon, TagIcon, UserPlusIcon, XIcon } from "lucide-react";
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

interface AddContactSheetProps {
  onAddContact: (contact: Contact) => void;
  customFields?: CustomFieldDefinition[];
}

export function AddContactSheet({
  onAddContact,
  customFields = [],
}: AddContactSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<Contact>>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    note: "",
    tags: "",
    defaultAddressCompany: "",
    defaultAddressAddress1: "",
    defaultAddressAddress2: "",
    defaultAddressCity: "",
    defaultAddressProvinceCode: "",
    defaultAddressCountryCode: "",
    defaultAddressZip: "",
    defaultAddressPhone: "",
    customFields: {},
  });
  const [customFieldKey, setCustomFieldKey] = React.useState("");
  const [customFieldValue, setCustomFieldValue] = React.useState("");
  const [newTag, setNewTag] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert("Please fill in required fields");
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    } as Contact;

    onAddContact(newContact);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      note: "",
      tags: "",
      defaultAddressCompany: "",
      defaultAddressAddress1: "",
      defaultAddressAddress2: "",
      defaultAddressCity: "",
      defaultAddressProvinceCode: "",
      defaultAddressCountryCode: "",
      defaultAddressZip: "",
      defaultAddressPhone: "",
      customFields: {},
    });
    setOpen(false);
  };

  const addCustomField = () => {
    if (customFieldKey && customFieldValue) {
      setFormData((prev) => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey]: customFieldValue,
        },
      }));
      setCustomFieldKey("");
      setCustomFieldValue("");
    }
  };

  const removeCustomField = (key: string) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.customFields || {};
      return { ...prev, customFields: rest };
    });
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Add New Contact</SheetTitle>
          <SheetDescription>
            Fill in the contact information. Fields marked with * are required.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            <div className="space-y-2">
              <Label htmlFor="company">Organization</Label>
              <Input
                id="company"
                value={formData.defaultAddressCompany}
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
                value={formData.defaultAddressAddress1}
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
                value={formData.defaultAddressAddress2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultAddressAddress2: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.defaultAddressCity}
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
                  value={formData.defaultAddressZip}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultAddressZip: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">State/Province Code</Label>
                <Input
                  id="province"
                  value={formData.defaultAddressProvinceCode}
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
                  value={formData.defaultAddressCountryCode}
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
                value={formData.defaultAddressPhone}
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

          {/* Tags Management */}
          <div className="space-y-4">
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
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} size="sm">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Custom Fields Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Custom Fields</h3>
            <div className="space-y-2">
              {formData.customFields &&
                Object.entries(formData.customFields).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded border p-2"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{key}:</span> {value}
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
            <div className="flex gap-2">
              <Input
                placeholder="Field name"
                value={customFieldKey}
                onChange={(e) => setCustomFieldKey(e.target.value)}
              />
              <Input
                placeholder="Field value"
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
              />
              <Button type="button" onClick={addCustomField} size="sm">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Predefined Custom Fields */}
          {customFields.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Fields</h3>
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
                            setFormData((prev) => ({
                              ...prev,
                              customFields: {
                                ...prev.customFields,
                                [field.name]: value,
                              },
                            }))
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
                            setFormData((prev) => ({
                              ...prev,
                              customFields: {
                                ...prev.customFields,
                                [field.name]: e.target.value,
                              },
                            }))
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
                            setFormData((prev) => ({
                              ...prev,
                              customFields: {
                                ...prev.customFields,
                                [field.name]: e.target.value,
                              },
                            }))
                          }
                          placeholder={field.description}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Additional information about the contact..."
                rows={3}
              />
            </div>
          </div>
        </form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSubmit}>Add Contact</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
