"use client";

import { AlertCircle, Check, Trash2, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Template = {
  id: string;
  name: string;
};

interface ScrollableTemplateSelectProps {
  templates: Template[];
  selectedTemplateId: string | null;
  // eslint-disable-next-line no-unused-vars
  onSelect: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

export function ScrollableTemplateSelect({
  templates,
  selectedTemplateId,
  onSelect,
  onDelete,
}: ScrollableTemplateSelectProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const selectContentRef = useRef<HTMLDivElement>(null);

  const handleSelectTemplate = useCallback(
    (value: string) => {
      if (!confirmingDelete) onSelect(value);
    },
    [confirmingDelete, onSelect],
  );

  const initiateDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmingDelete(id);

    const currentTarget = e.currentTarget;
    const preventSelect = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
      currentTarget.removeEventListener("click", preventSelect, true);
    };

    currentTarget.addEventListener("click", preventSelect, true);
  }, []);

  const confirmDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onDelete(id);
      setConfirmingDelete(null);
    },
    [onDelete],
  );

  const cancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmingDelete(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        confirmingDelete &&
        selectContentRef.current &&
        !selectContentRef.current.contains(e.target as Node)
      ) {
        setConfirmingDelete(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [confirmingDelete]);

  return (
    <div className="my-2 w-full">
      <Select
        value={selectedTemplateId || ""}
        onValueChange={handleSelectTemplate}
      >
        <SelectTrigger className="h-auto w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400">
          <div className="flex w-full items-center justify-between">
            <SelectValue placeholder="Select a template…" />
          </div>
        </SelectTrigger>
        <SelectContent
          ref={selectContentRef}
          position="popper"
          side="bottom"
          align="start"
          className="max-h-[300px] overflow-y-auto bg-white"
        >
          <SelectGroup>
            {templates.map((template) => (
              <div
                key={template.id}
                className="relative flex items-center"
                onMouseDown={(e) =>
                  confirmingDelete === template.id && e.preventDefault()
                }
              >
                <SelectItem value={template.id} className="flex-1 pr-10">
                  <span className="block truncate">{template.name}</span>
                </SelectItem>

                <div
                  className="absolute right-2 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {confirmingDelete === template.id ? (
                    <div className="flex items-center space-x-1">
                      <span className="mr-1 text-xs text-red-500">Delete?</span>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-green-600 hover:bg-green-100"
                        onClick={(e) => confirmDelete(template.id, e)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                        onClick={cancelDelete}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-red-500 opacity-0 transition-opacity hover:bg-red-50 hover:opacity-100 group-hover:opacity-100"
                      onClick={(e) => initiateDelete(template.id, e)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                <AlertCircle className="mr-2 h-4 w-4" />
                No templates available
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
