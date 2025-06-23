"use client";

import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Contact } from "@/lib/types";

interface TableFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  contacts: Contact[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  tags: string[];
  countries: string[];
  organizations: string[];
  voterStatus: string[];
  precincts: string[];
  dateRange: string;
}

export function TableFilters({
  searchValue,
  onSearchChange,
  contacts,
  onFilterChange,
}: TableFiltersProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    tags: [],
    countries: [],
    organizations: [],
    voterStatus: [],
    precincts: [],
    dateRange: "all",
  });

  // Extract unique values for filter options
  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.tags) {
        contact.tags.split(",").forEach((tag) => tags.add(tag.trim()));
      }
    });
    return Array.from(tags).sort();
  }, [contacts]);

  const uniqueCountries = React.useMemo(() => {
    const countries = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.defaultAddressCountryCode) {
        countries.add(contact.defaultAddressCountryCode);
      }
    });
    return Array.from(countries).sort();
  }, [contacts]);

  const uniqueOrganizations = React.useMemo(() => {
    const organizations = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.defaultAddressCompany) {
        organizations.add(contact.defaultAddressCompany);
      }
    });
    return Array.from(organizations).sort();
  }, [contacts]);

  const uniqueVoterStatus = React.useMemo(() => {
    const statuses = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.customFields?.voterStatus) {
        statuses.add(contact.customFields.voterStatus);
      }
    });
    return Array.from(statuses).sort();
  }, [contacts]);

  const uniquePrecincts = React.useMemo(() => {
    const precincts = new Set<string>();
    contacts.forEach((contact) => {
      if (contact.customFields?.precinct) {
        precincts.add(contact.customFields.precinct);
      }
    });
    return Array.from(precincts).sort();
  }, [contacts]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      tags: [],
      countries: [],
      organizations: [],
      voterStatus: [],
      precincts: [],
      dateRange: "all",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some((filter) =>
    Array.isArray(filter) ? filter.length > 0 : filter !== "all",
  );

  const activeFilterCount =
    filters.tags.length +
    filters.countries.length +
    filters.organizations.length +
    filters.voterStatus.length +
    filters.precincts.length +
    (filters.dateRange !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="mr-2 h-4 w-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Contacts</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <XIcon className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>

              <Separator />

              {/* Tags Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {uniqueTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => toggleArrayFilter("tags", tag)}
                      />
                      <Label htmlFor={`tag-${tag}`} className="text-sm">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Voter Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Voter Status</Label>
                <div className="space-y-1">
                  {uniqueVoterStatus.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.voterStatus.includes(status)}
                        onCheckedChange={() =>
                          toggleArrayFilter("voterStatus", status)
                        }
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Precincts Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Precincts</Label>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {uniquePrecincts.map((precinct) => (
                    <div key={precinct} className="flex items-center space-x-2">
                      <Checkbox
                        id={`precinct-${precinct}`}
                        checked={filters.precincts.includes(precinct)}
                        onCheckedChange={() =>
                          toggleArrayFilter("precincts", precinct)
                        }
                      />
                      <Label
                        htmlFor={`precinct-${precinct}`}
                        className="text-sm"
                      >
                        {precinct}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Countries Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Countries</Label>
                <div className="space-y-1">
                  {uniqueCountries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={filters.countries.includes(country)}
                        onCheckedChange={() =>
                          toggleArrayFilter("countries", country)
                        }
                      />
                      <Label htmlFor={`country-${country}`} className="text-sm">
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Organizations Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Organizations</Label>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {uniqueOrganizations.map((org) => (
                    <div key={org} className="flex items-center space-x-2">
                      <Checkbox
                        id={`org-${org}`}
                        checked={filters.organizations.includes(org)}
                        onCheckedChange={() =>
                          toggleArrayFilter("organizations", org)
                        }
                      />
                      <Label
                        htmlFor={`org-${org}`}
                        className="truncate text-sm"
                      >
                        {org}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Added</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => updateFilter("dateRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <Badge
              key={`tag-${tag}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              Tag: {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleArrayFilter("tags", tag)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.voterStatus.map((status) => (
            <Badge
              key={`status-${status}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              Status: {status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleArrayFilter("voterStatus", status)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.precincts.map((precinct) => (
            <Badge
              key={`precinct-${precinct}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              Precinct: {precinct}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleArrayFilter("precincts", precinct)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.countries.map((country) => (
            <Badge
              key={`country-${country}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              Country: {country}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleArrayFilter("countries", country)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.organizations.map((org) => (
            <Badge
              key={`org-${org}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              Org: {org}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleArrayFilter("organizations", org)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.dateRange !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.dateRange}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter("dateRange", "all")}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
