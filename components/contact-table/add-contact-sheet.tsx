"use client";

import { ChevronDownIcon, PlusIcon, TagIcon, XIcon } from "lucide-react";
import posthog from "posthog-js";
import * as React from "react";

import type { CustomFieldDefinition } from "@/components/custom-fields-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/types";

interface AddContactSheetProps {
  onAddContact: (contact: Contact) => void;
  customFields?: CustomFieldDefinition[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddContactSheet({
  onAddContact,
  customFields = [],
  open: controlledOpen,
  onOpenChange,
}: AddContactSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Prefer controlled mode if open prop is present
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
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
  const [newTag, setNewTag] = React.useState("");
  const [addressOpen, setAddressOpen] = React.useState(false);
  const [tagsOpen, setTagsOpen] = React.useState(false);

  const hasRequiredEmail = () => Boolean(formData.email?.trim());

  const resetForm = () => {
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
    setNewTag("");
    setAddressOpen(false);
    setTagsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasRequiredEmail()) {
      alert("Email is required");
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    } as Contact;

    posthog.capture("contact_added", {
      has_custom_fields: Object.keys(formData.customFields || {}).length > 0,
      has_tags: !!formData.tags,
    });

    onAddContact(newContact);
    resetForm();
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex h-full w-[600px] flex-col p-0 sm:max-w-[600px]">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b px-6 pt-6 pb-4">
            <SheetTitle>Add New Contact</SheetTitle>
            <SheetDescription>
              Fill in contact information. Email is required.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-6 px-6 py-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
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
                      value={formData.lastName}
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
                    value={formData.phone}
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

              <Collapsible
                open={addressOpen}
                onOpenChange={setAddressOpen}
                className="space-y-4"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-between px-0 text-lg font-medium"
                  >
                    Address Information
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${addressOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
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
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              <Collapsible
                open={tagsOpen}
                onOpenChange={setTagsOpen}
                className="space-y-4"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-between px-0 text-lg font-medium"
                  >
                    Tags
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${tagsOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
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
                </CollapsibleContent>
              </Collapsible>

              <Separator />

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

              <div className="space-y-4 pb-2">
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
            </div>
          </div>

          <SheetFooter className="flex-row justify-between border-t bg-white px-6 py-4 dark:bg-[#2D2D2D]">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit">Add Contact</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
