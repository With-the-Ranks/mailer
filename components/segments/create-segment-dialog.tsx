"use client";

import { PlusIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Contact } from "@/lib/types";

interface CreateSegmentDialogProps {
  listId: string;
  filteredContacts?: Contact[];
  selectedContacts?: Contact[];
  activeFilters?: Record<string, any>;
  searchValue?: string;
  onSegmentCreated?: () => void;
}

const FILTER_LABELS: Record<string, string> = {
  tags: "Tags",
  countries: "Countries",
  organizations: "Organizations",
  precincts: "Precincts",
  defaultAddressPhone: "Phone",
  defaultAddressZip: "Zip",
  defaultAddressCity: "City",
  defaultAddressAddress1: "Address",
  defaultAddressAddress2: "Address 2",
  defaultAddressProvinceCode: "Province",
  defaultAddressCountryCode: "Country",
  // Add any additional labels you want here
};

export function CreateSegmentDialog({
  listId,
  filteredContacts,
  selectedContacts,
  activeFilters = {},
  searchValue = "",
  onSegmentCreated,
}: CreateSegmentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Determine which contacts and criteria to use
  const isStatic = !!selectedContacts && selectedContacts.length > 0;
  const contactsToUse = isStatic
    ? selectedContacts
    : filteredContacts
      ? filteredContacts
      : [];

  // For static segments, we store contactIds; for dynamic, we store filterCriteria
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Segment name is required");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim() || null,
        audienceListId: listId,
      };

      if (isStatic) {
        payload.contactIds = selectedContacts!.map((c) => c.id);
        payload.filterCriteria = {}; // or null
      } else {
        payload.filterCriteria = {
          searchValue,
          ...activeFilters,
        };
        // Optionally, you could also send contactIds for preview, but not needed for dynamic
      }

      const response = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Segment created successfully");
        setOpen(false);
        setName("");
        setDescription("");
        onSegmentCreated?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create segment");
      }
    } catch (error) {
      console.error("Failed to create segment:", error);
      toast.error("Failed to create segment");
    } finally {
      setIsLoading(false);
    }
  };

  const getFilterSummary = () => {
    const summary: string[] = [];

    if (searchValue) {
      summary.push(`Search: "${searchValue}"`);
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (
        key === "dateRange" || // skip dateRange if not used
        !value ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return;
      }
      const label = FILTER_LABELS[key] || key;
      if (Array.isArray(value)) {
        summary.push(`${label}: ${value.join(", ")}`);
      } else {
        summary.push(`${label}: ${value}`);
      }
    });

    return summary;
  };

  const filterSummary = getFilterSummary();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          {isStatic
            ? `Create Segment from Selection (${contactsToUse.length})`
            : `Create Segment (${contactsToUse.length})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Segment</DialogTitle>
            <DialogDescription>
              {isStatic
                ? `Create a segment from ${contactsToUse.length} selected contacts`
                : `Create a segment from the current filtered results (${contactsToUse.length} contacts)`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Segment Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter segment name..."
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this segment..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {!isStatic && filterSummary.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Applied Filters</Label>
                  <div className="space-y-1">
                    {filterSummary.map((filter, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {filter}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Segment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
