"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Organization = {
  id: string;
  name: string | null;
  role: string;
};

type OrganizationSwitcherProps = {
  organizations: Organization[];
  currentOrgId?: string;
};

export default function OrganizationSwitcher({
  organizations,
  currentOrgId,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  const switchOrganization = async (orgId: string) => {
    if (orgId === currentOrgId) {
      setOpen(false);
      return;
    }

    setSwitching(true);
    try {
      const response = await fetch("/api/organization/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch organization");
      }

      toast.success("Organization switched");
      router.push(`/organization/${orgId}`);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error("Error switching organization:", error);
      toast.error("Failed to switch organization");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full items-center justify-between px-4"
          disabled={switching}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="truncate">
              {currentOrg?.name || "Select organization..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] rounded-none bg-white p-0">
        <Command className="bg-white">
          <CommandList>
            <CommandEmpty className="text-gray-500">
              No organization found.
            </CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.id}
                  onSelect={() => switchOrganization(org.id)}
                  className="cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentOrgId === org.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{org.name || "Unnamed Organization"}</span>
                    <span className="text-muted-foreground text-xs">
                      {org.role}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
