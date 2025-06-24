"use client";

import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Contact } from "@/lib/types";
interface TableFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  contacts: Contact[];
  activeFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  table: Table<Contact>;
}

const BASE_FILTER_FIELDS = [
  { key: "tags", label: "Tags" },
  { key: "defaultAddressCompany", label: "Organizations" },
  { key: "defaultAddressCountryCode", label: "Country" },
  { key: "defaultAddressProvinceCode", label: "Precinct" },
  { key: "defaultAddressZip", label: "Zip Code" },
];

export function TableFilters({
  searchValue,
  onSearchChange,
  contacts,
  activeFilters,
  onFiltersChange,
  table,
}: TableFiltersProps) {
  // Dynamically get options for each base field
  const baseFieldOptions = React.useMemo(() => {
    const map: Record<string, { label: string; values: string[] }> = {};
    for (const { key, label } of BASE_FILTER_FIELDS) {
      const values = new Set<string>();
      contacts.forEach((contact) => {
        const value = contact[key as keyof Contact] as string | undefined;
        if (value) {
          if (key === "tags") {
            value.split(",").forEach((tag) => values.add(tag.trim()));
          } else {
            values.add(value);
          }
        }
      });
      const arr = Array.from(values).filter(Boolean).sort();
      if (arr.length > 1) {
        map[key] = { label, values: arr };
      }
    }
    return map;
  }, [contacts]);

  // Get custom field options with >1 value
  const customFieldOptions = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    contacts.forEach((contact) => {
      if (contact.customFields) {
        Object.entries(contact.customFields).forEach(([k, v]) => {
          if (!map[k]) map[k] = [];
          if (typeof v === "string" && v.trim() && !map[k].includes(v.trim())) {
            map[k].push(v.trim());
          }
        });
      }
    });
    Object.keys(map).forEach((k) => {
      if (map[k].length < 2) delete map[k];
    });
    return map;
  }, [contacts]);

  React.useEffect(() => {
    const filters:
      | ((old: ColumnFiltersState) => ColumnFiltersState)
      | { id: string; value: any }[] = [];
    table.setGlobalFilter(searchValue || "");

    Object.keys(activeFilters).forEach((key) => {
      if (
        !activeFilters[key] ||
        (Array.isArray(activeFilters[key]) && activeFilters[key].length === 0)
      )
        return;
      filters.push({ id: key, value: activeFilters[key] });
    });

    table.setColumnFilters(filters);
  }, [searchValue, activeFilters, table]);

  // Handlers
  const handleFilterToggle = (field: string, value: string) => {
    const prev = activeFilters[field] || [];
    const next = prev.includes(value)
      ? prev.filter((v: string) => v !== value)
      : [...prev, value];
    onFiltersChange({ ...activeFilters, [field]: next });
  };

  const clearAllFilters = React.useCallback(() => {
    const reset: Record<string, any> = {};
    Object.keys(baseFieldOptions).forEach((f) => (reset[f] = []));
    Object.keys(customFieldOptions).forEach((f) => (reset[f] = []));
    onSearchChange("");
    onFiltersChange(reset);
  }, [baseFieldOptions, customFieldOptions, onFiltersChange, onSearchChange]);

  const activeFilterCount =
    (searchValue ? 1 : 0) +
    Object.keys(baseFieldOptions).reduce(
      (acc, key) => acc + (activeFilters[key]?.length || 0),
      0,
    ) +
    Object.keys(customFieldOptions).reduce(
      (acc, key) => acc + (activeFilters[key]?.length || 0),
      0,
    );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search contacts..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Dynamically generated base field filters */}
        {Object.entries(baseFieldOptions).map(([field, { label, values }]) => (
          <Popover key={field}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <FilterIcon className="mr-2 h-4 w-4" />
                {label}
                {activeFilters[field]?.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {activeFilters[field].length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <h4 className="font-medium">Filter by {label}</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {values.map((v) => (
                      <div key={v} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field}-${v}`}
                          checked={activeFilters[field]?.includes(v)}
                          onCheckedChange={() => handleFilterToggle(field, v)}
                        />
                        <label htmlFor={`${field}-${v}`} className="text-sm">
                          {v}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        ))}

        {/* Custom fields filters */}
        {Object.entries(customFieldOptions).map(([field, values]) => (
          <Popover key={field}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <FilterIcon className="mr-2 h-4 w-4" />
                {field}
                {activeFilters[field]?.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {activeFilters[field].length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <h4 className="font-medium">Filter by {field}</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {values.map((v) => (
                      <div key={v} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field}-${v}`}
                          checked={activeFilters[field]?.includes(v)}
                          onCheckedChange={() => handleFilterToggle(field, v)}
                        />
                        <label htmlFor={`${field}-${v}`} className="text-sm">
                          {v}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        ))}

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8"
            >
              <XIcon className="mr-2 h-4 w-4" />
              Clear ({activeFilterCount})
            </Button>
          </>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchValue && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchValue}
              <XIcon
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSearchChange("")}
              />
            </Badge>
          )}
          {Object.entries(baseFieldOptions).map(([field, { label }]) =>
            (activeFilters[field] || []).map((v: string) => (
              <Badge
                key={`${field}-${v}`}
                variant="secondary"
                className="gap-1"
              >
                {label}: {v}
                <XIcon
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterToggle(field, v)}
                />
              </Badge>
            )),
          )}
          {Object.entries(customFieldOptions).map(([field]) =>
            (activeFilters[field] || []).map((v: string) => (
              <Badge
                key={`${field}-${v}`}
                variant="secondary"
                className="gap-1"
              >
                {field}: {v}
                <XIcon
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterToggle(field, v)}
                />
              </Badge>
            )),
          )}
        </div>
      )}
    </div>
  );
}
