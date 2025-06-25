"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldMapping } from "@/lib/types";

import { CONTACT_FIELDS } from "./constants";

interface MappingFieldsListProps {
  fieldMappings: FieldMapping[];
  csvHeaders: string[];
  handleMappingChange: (contactField: string, csvColumn: string) => void;
}

export function MappingFieldsList({
  fieldMappings = [],
  csvHeaders = [],
  handleMappingChange,
}: MappingFieldsListProps) {
  // Guard clause to ensure we have the required data
  if (!fieldMappings || !csvHeaders || !handleMappingChange) {
    return <div>Loading mapping fields...</div>;
  }

  return (
    <div className="space-y-4">
      {CONTACT_FIELDS.map((field) => {
        const mapping = fieldMappings.find((m) => m.contactField === field.key);
        return (
          <div key={field.key} className="grid grid-cols-2 items-center gap-4">
            <Label className="font-medium">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </Label>
            <Select
              value={mapping?.csvColumn || ""}
              onValueChange={(value) => handleMappingChange(field.key, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CSV column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="--skip--">-- Skip --</SelectItem>
                {csvHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
