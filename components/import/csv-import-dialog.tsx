"use client";

import {
  ArrowRightIcon,
  CheckIcon,
  FileIcon,
  FileTextIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Contact, FieldMapping, ImportProgress } from "@/lib/types";

import { CompleteStep } from "./complete-step";
import { CONTACT_FIELDS } from "./constants";
import { ImportingStep } from "./importing-step";
import { MappingStep } from "./mapping-step";
import { PreviewStep } from "./preview-step";
import { generateSampleCsvData } from "./sampleCsvData";
import { UploadStep } from "./upload-step";

interface CsvImportDialogProps {
  audienceListId: string;
  onImportComplete: (contacts: Contact[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CsvImportDialog({
  audienceListId,
  onImportComplete,
  open: controlledOpen,
  onOpenChange,
}: CsvImportDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Prefer controlled mode if open prop is present
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [step, setStep] = React.useState("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [csvData, setCsvData] = React.useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = React.useState<FieldMapping[]>([]);
  const [importProgress, setImportProgress] = React.useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [],
  });
  const [previewData, setPreviewData] = React.useState<Contact[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      const data = lines
        .slice(1)
        .map((line) =>
          line.split(",").map((cell) => cell.trim().replace(/"/g, "")),
        );
      setCsvHeaders(headers);
      setCsvData(data);

      // Auto-map common fields
      const autoMappings = CONTACT_FIELDS.map((field) => {
        const matchingHeader = headers.find(
          (header) =>
            header.toLowerCase().includes(field.key.toLowerCase()) ||
            field.label.toLowerCase().includes(header.toLowerCase()) ||
            (field.key === "firstName" &&
              header.toLowerCase().includes("first")) ||
            (field.key === "lastName" && header.toLowerCase().includes("last")),
        );
        return {
          csvColumn: matchingHeader || "",
          contactField: field.key,
          required: field.required,
        };
      });
      setFieldMappings(autoMappings);
      setStep("mapping");
    };
    reader.readAsText(uploadedFile);
  };

  // Handle mapping change
  const handleMappingChange = (contactField: string, csvColumn: string) => {
    setFieldMappings((prev) =>
      prev.map((mapping) =>
        mapping.contactField === contactField
          ? { ...mapping, csvColumn }
          : mapping,
      ),
    );
  };

  // Generate preview data
  const generatePreview = () => {
    const preview = csvData.slice(0, 5).map((row, index) => {
      const contact: Contact = {
        audienceListId,
        id: `preview-${index}`,
        customFields: {},
        firstName: "",
        lastName: "",
        email: "",
      };
      fieldMappings.forEach((mapping) => {
        if (mapping.csvColumn) {
          const columnIndex = csvHeaders.indexOf(mapping.csvColumn);
          if (columnIndex !== -1 && row[columnIndex]) {
            if (CONTACT_FIELDS.find((f) => f.key === mapping.contactField)) {
              (contact as any)[mapping.contactField] = row[columnIndex];
            } else {
              contact.customFields![mapping.contactField] = row[columnIndex];
            }
          }
        }
      });
      // Unmapped columns as custom fields
      csvHeaders.forEach((header, index) => {
        const isMapped = fieldMappings.some((m) => m.csvColumn === header);
        if (!isMapped && row[index]) {
          contact.customFields![header] = row[index];
        }
      });
      return contact;
    });
    setPreviewData(preview);
    setStep("preview");
  };

  // Import simulation
  const startImport = async () => {
    setStep("importing");
    const total = csvData.length;
    setImportProgress({
      total,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });
    const importedContacts: Contact[] = [];
    const errors: any[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        const contact: Contact = {
          audienceListId,
          id: `imported-${Date.now()}-${i}`,
          customFields: {},
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          firstName: "",
          lastName: "",
          email: "",
        };

        // Required fields check
        const requiredMappings = fieldMappings.filter(
          (m) => m.required && m.csvColumn,
        );
        for (const mapping of requiredMappings) {
          const columnIndex = csvHeaders.indexOf(mapping.csvColumn);
          if (columnIndex === -1 || !row[columnIndex]?.trim()) {
            throw new Error(
              `Required field ${mapping.contactField} is missing`,
            );
          }
        }

        // Map fields
        fieldMappings.forEach((mapping) => {
          if (mapping.csvColumn) {
            const columnIndex = csvHeaders.indexOf(mapping.csvColumn);
            if (columnIndex !== -1 && row[columnIndex]) {
              if (CONTACT_FIELDS.find((f) => f.key === mapping.contactField)) {
                (contact as any)[mapping.contactField] =
                  row[columnIndex].trim();
              } else {
                contact.customFields![mapping.contactField] =
                  row[columnIndex].trim();
              }
            }
          }
        });

        // Unmapped as custom fields
        csvHeaders.forEach((header, index) => {
          const isMapped = fieldMappings.some((m) => m.csvColumn === header);
          if (!isMapped && row[index]?.trim()) {
            contact.customFields![header] = row[index].trim();
          }
        });

        importedContacts.push(contact);
        setImportProgress((prev) => ({
          ...prev,
          processed: i + 1,
          successful: prev.successful + 1,
        }));
      } catch (error) {
        errors.push({
          row: i + 2, // +2 for header
          field: "general",
          value: row.join(","),
          error: error instanceof Error ? error.message : "Unknown error",
        });
        setImportProgress((prev) => ({
          ...prev,
          processed: i + 1,
          failed: prev.failed + 1,
          errors: [...prev.errors, ...errors],
        }));
      }
      if (i % 10 === 0) await new Promise((resolve) => setTimeout(resolve, 10));
    }
    onImportComplete(importedContacts);
    setStep("complete");
  };

  // Download sample CSV
  const downloadSampleCsv = () => {
    const blob = new Blob([generateSampleCsvData()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset dialog
  const resetDialog = () => {
    setStep("upload");
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setImportProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    });
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetDialog, 300);
  };

  const canProceedFromMapping = React.useMemo(() => {
    return fieldMappings
      .filter((m) => m.required)
      .every((m) => m.csvColumn && m.csvColumn !== "skip");
  }, [fieldMappings]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[95vh] min-h-0 max-w-5xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Import Contacts from CSV
          </DialogTitle>
          <DialogDescription>
            Import hundreds or thousands of contacts from a CSV file with
            intelligent field mapping
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-0 min-h-0 flex-1 flex-col">
          <Tabs value={step} className="flex flex-1 flex-col">
            <TabsList className="grid w-full shrink-0 grid-cols-5">
              <TabsTrigger value="upload" className="flex items-center gap-1">
                <FileIcon className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="mapping"
                disabled={step === "upload"}
                className="flex items-center gap-1"
              >
                <ArrowRightIcon className="h-4 w-4" />
                Mapping
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={!["preview", "importing", "complete"].includes(step)}
                className="flex items-center gap-1"
              >
                <FileTextIcon className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="importing"
                disabled={step !== "importing"}
                className="flex items-center gap-1"
              >
                <UploadIcon className="h-4 w-4" />
                Import
              </TabsTrigger>
              <TabsTrigger
                value="complete"
                disabled={step !== "complete"}
                className="flex items-center gap-1"
              >
                <CheckIcon className="h-4 w-4" />
                Complete
              </TabsTrigger>
            </TabsList>
            <div className="mt-4 min-h-0 flex-1">
              {step === "upload" && (
                <UploadStep
                  file={file}
                  csvData={csvData}
                  fileInputRef={fileInputRef}
                  onFileUpload={handleFileUpload}
                  onDownloadSample={downloadSampleCsv}
                />
              )}
              {step === "mapping" && (
                <MappingStep
                  fieldMappings={fieldMappings}
                  csvHeaders={csvHeaders}
                  canProceedFromMapping={canProceedFromMapping}
                  onMappingChange={handleMappingChange}
                  onBack={() => setStep("upload")}
                  onNext={generatePreview}
                />
              )}
              {step === "preview" && (
                <PreviewStep
                  previewData={previewData}
                  totalRecords={csvData.length}
                  onBack={() => setStep("mapping")}
                  onStartImport={startImport}
                />
              )}
              {step === "importing" && (
                <ImportingStep importProgress={importProgress} />
              )}
              {step === "complete" && (
                <CompleteStep
                  importProgress={importProgress}
                  onClose={handleClose}
                />
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
