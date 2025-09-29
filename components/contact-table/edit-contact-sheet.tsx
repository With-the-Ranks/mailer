"use client";

import { EditIcon, PlusIcon, TagIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

export function EditContactSheet({
  contact,
  onUpdateContact,
}: EditContactSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Contact>(contact);
  const [customFieldKey, setCustomFieldKey] = React.useState("");
  const [customFieldValue, setCustomFieldValue] = React.useState("");
  const [newTag, setNewTag] = React.useState("");

  React.useEffect(() => {
    setFormData(contact);
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert("Please fill in required fields");
      return;
    }

    const updatedContact: Contact = {
      ...formData,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    onUpdateContact(updatedContact);
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
        <Button variant="ghost" size="sm">
          <EditIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Edit Contact</SheetTitle>
          <SheetDescription>
            Update contact information. Fields marked with * are required.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Address Information */}
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

          {/* Tags Management */}
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
          <div className="space-y-2">
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

          <Separator />

          {/* Note */}
          <div className="space-y-2">
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
        </form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSubmit}>Update Contact</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
