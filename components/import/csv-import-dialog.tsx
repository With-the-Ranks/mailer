"use client";

import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  InfoIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Contact,
  FieldMapping,
  ImportError,
  ImportProgress,
} from "@/lib/types";

interface CsvImportDialogProps {
  onImportComplete: (contacts: Contact[]) => void;
  trigger?: React.ReactNode;
}

const CONTACT_FIELDS = [
  { key: "email", label: "Email", required: true },
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name", required: true },
  { key: "phone", label: "Phone", required: false },
  { key: "note", label: "Note", required: false },
  { key: "tags", label: "Tags", required: false },
  {
    key: "defaultAddressCompany",
    label: "Company/Organization",
    required: false,
  },
  { key: "defaultAddressAddress1", label: "Address Line 1", required: false },
  { key: "defaultAddressAddress2", label: "Address Line 2", required: false },
  { key: "defaultAddressCity", label: "City", required: false },
  {
    key: "defaultAddressProvinceCode",
    label: "State/Province",
    required: false,
  },
  { key: "defaultAddressCountryCode", label: "Country Code", required: false },
  { key: "defaultAddressZip", label: "Zip Code", required: false },
  { key: "defaultAddressPhone", label: "Address Phone", required: false },
];

function generateSampleCsvData(): string {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emily",
    "Robert",
    "Jessica",
    "William",
    "Ashley",
    "James",
    "Amanda",
    "Christopher",
    "Stephanie",
    "Daniel",
    "Melissa",
    "Matthew",
    "Nicole",
    "Anthony",
    "Elizabeth",
    "Mark",
    "Helen",
    "Donald",
    "Deborah",
    "Steven",
    "Dorothy",
    "Paul",
    "Lisa",
    "Andrew",
    "Nancy",
    "Joshua",
    "Karen",
    "Kenneth",
    "Betty",
    "Kevin",
    "Sandra",
    "Brian",
    "Donna",
    "George",
    "Carol",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
  ];

  const cities = [
    "Springfield",
    "Franklin",
    "Greenville",
    "Bristol",
    "Fairview",
    "Salem",
    "Madison",
    "Georgetown",
    "Arlington",
    "Ashland",
    "Burlington",
    "Manchester",
    "Oxford",
    "Milford",
    "Clayton",
    "Auburn",
    "Dayton",
    "Lexington",
    "Riverside",
    "Cleveland",
  ];

  const tags = [
    "volunteer",
    "voter",
    "phone-bank",
    "canvassing",
    "digital-outreach",
    "fundraising",
    "event-planning",
    "social-media",
    "environment",
    "education",
    "healthcare",
    "housing",
  ];

  const voterStatuses = [
    "Registered",
    "Newly Registered",
    "Unregistered",
    "Moved",
    "Inactive",
  ];
  const precincts = [
    "01-A",
    "01-B",
    "02-A",
    "02-B",
    "03-A",
    "03-B",
    "04-A",
    "04-B",
    "05-A",
    "05-B",
    "06-A",
    "06-B",
    "07-A",
    "07-B",
    "08-A",
    "08-B",
    "09-A",
    "09-B",
    "10-A",
    "10-B",
  ];

  function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const header =
    "email,firstName,lastName,phone,tags,city,company,voterStatus,precinct,priority,address,zip,state,country";
  const rows = [];

  for (let i = 1; i <= 100; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
    const phone = `555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    const contactTags = getRandomElements(
      tags,
      Math.floor(Math.random() * 3) + 1,
    ).join(";");
    const city = getRandomElement(cities);
    const company =
      Math.random() > 0.5
        ? `${getRandomElement(["Community", "Local", "Springfield", "Metro"])} ${getRandomElement(["Center", "Group", "Organization", "Association"])}`
        : "";
    const voterStatus = getRandomElement(voterStatuses);
    const precinct = getRandomElement(precincts);
    const priority = getRandomElement(["High", "Medium", "Low"]);
    const address = `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(["Main St", "Oak Ave", "Elm St", "Park Rd", "First Ave"])}`;
    const zip = `627${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;

    rows.push(
      `${email},${firstName},${lastName},${phone},"${contactTags}",${city},"${company}",${voterStatus},${precinct},${priority},"${address}",${zip},IL,US`,
    );
  }

  return [header, ...rows].join("\n");
}

const SAMPLE_CSV_DATA = generateSampleCsvData();

export function CsvImportDialog({
  onImportComplete,
  trigger,
}: CsvImportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<
    "upload" | "mapping" | "preview" | "importing" | "complete"
  >("upload");
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
      const autoMappings: FieldMapping[] = CONTACT_FIELDS.map((field) => {
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

  const handleMappingChange = (contactField: string, csvColumn: string) => {
    setFieldMappings((prev) =>
      prev.map((mapping) =>
        mapping.contactField === contactField
          ? { ...mapping, csvColumn }
          : mapping,
      ),
    );
  };

  const generatePreview = () => {
    const preview: Contact[] = csvData.slice(0, 5).map((row, index) => {
      const contact: Partial<Contact> = {
        id: `preview-${index}`,
        customFields: {},
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

      // Handle unmapped columns as custom fields
      csvHeaders.forEach((header, index) => {
        const isMapped = fieldMappings.some((m) => m.csvColumn === header);
        if (!isMapped && row[index]) {
          contact.customFields![header] = row[index];
        }
      });

      return contact as Contact;
    });

    setPreviewData(preview);
    setStep("preview");
  };

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
    const errors: ImportError[] = [];

    // Simulate processing with progress updates
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        const contact: Partial<Contact> = {
          id: `imported-${Date.now()}-${i}`,
          customFields: {},
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        };

        // Validate required fields
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

        // Handle unmapped columns as custom fields
        csvHeaders.forEach((header, index) => {
          const isMapped = fieldMappings.some((m) => m.csvColumn === header);
          if (!isMapped && row[index]?.trim()) {
            contact.customFields![header] = row[index].trim();
          }
        });

        importedContacts.push(contact as Contact);

        setImportProgress((prev) => ({
          ...prev,
          processed: i + 1,
          successful: prev.successful + 1,
        }));
      } catch (error) {
        errors.push({
          row: i + 2, // +2 because of 0-index and header row
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

      // Simulate processing time
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    onImportComplete(importedContacts);
    setStep("complete");
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetDialog, 300); // Reset after dialog closes
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UploadIcon className="mr-2 h-4 w-4" />
            Import Contacts
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Import Contacts from CSV
          </DialogTitle>
          <DialogDescription>
            Import hundreds or thousands of contacts from a CSV file with
            intelligent field mapping
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={step} className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-5">
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

            <div className="mt-4 flex-1 overflow-auto">
              <TabsContent value="upload" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                    <CardDescription>
                      Select a CSV file containing your contact data. We support
                      files with thousands of records.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-8 text-center">
                      <UploadIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          Drop your CSV file here
                        </p>
                        <p className="text-muted-foreground text-sm">
                          or click to browse
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()}>
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {file && (
                      <Alert>
                        <FileTextIcon className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{file.name}</strong> (
                          {(file.size / 1024).toFixed(1)} KB) - {csvData.length}{" "}
                          records found
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>
                      Download our sample CSV template to see the expected
                      format
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <DownloadIcon className="text-muted-foreground h-5 w-5" />
                        <div>
                          <p className="font-medium">Sample CSV Template</p>
                          <p className="text-muted-foreground text-sm">
                            Includes common fields for voters and volunteers
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={downloadSampleCsv}>
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mapping" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Map CSV Columns to Contact Fields</CardTitle>
                    <CardDescription>
                      We&apos;ve automatically detected and mapped common
                      fields. Review and adjust as needed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {fieldMappings.map((mapping) => {
                          const field = CONTACT_FIELDS.find(
                            (f) => f.key === mapping.contactField,
                          );
                          return (
                            <div
                              key={mapping.contactField}
                              className="flex items-center gap-4 rounded-lg border p-3"
                            >
                              <div className="flex-1">
                                <Label className="font-medium">
                                  {field?.label}
                                  {field?.required && (
                                    <span className="ml-1 text-red-500">*</span>
                                  )}
                                </Label>
                                <p className="text-muted-foreground text-sm">
                                  {mapping.contactField}
                                </p>
                              </div>
                              <ArrowRightIcon className="text-muted-foreground h-4 w-4" />
                              <div className="flex-1">
                                <Select
                                  value={mapping.csvColumn}
                                  onValueChange={(value) =>
                                    handleMappingChange(
                                      mapping.contactField,
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select CSV column" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="skip">
                                      -- Skip this field --
                                    </SelectItem>
                                    {csvHeaders.map((header) => (
                                      <SelectItem key={header} value={header}>
                                        {header}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    <Alert className="mt-4">
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription>
                        Unmapped CSV columns will be automatically added as
                        custom fields. Required fields (marked with *) must be
                        mapped to proceed.
                      </AlertDescription>
                    </Alert>

                    <div className="mt-6 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setStep("upload")}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={generatePreview}
                        disabled={fieldMappings
                          .filter((m) => m.required)
                          .some((m) => !m.csvColumn)}
                      >
                        Preview Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview Import Data</CardTitle>
                    <CardDescription>
                      Review the first 5 records to ensure the mapping is
                      correct
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {previewData.map((contact, index) => (
                          <div
                            key={index}
                            className="space-y-2 rounded-lg border p-4"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Row {index + 2}</Badge>
                              <span className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </span>
                              <span className="text-muted-foreground">
                                ({contact.email})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Phone:</strong> {contact.phone || "N/A"}
                              </div>
                              <div>
                                <strong>City:</strong>{" "}
                                {contact.defaultAddressCity || "N/A"}
                              </div>
                              {contact.customFields &&
                                Object.keys(contact.customFields).length >
                                  0 && (
                                  <div className="col-span-2">
                                    <strong>Custom Fields:</strong>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {Object.entries(contact.customFields).map(
                                        ([key, value]) => (
                                          <Badge
                                            key={key}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {key}: {value}
                                          </Badge>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Alert className="mt-4">
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription>
                        Ready to import {csvData.length} contacts. This process
                        may take a few moments for large files.
                      </AlertDescription>
                    </Alert>

                    <div className="mt-6 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setStep("mapping")}
                      >
                        Back to Mapping
                      </Button>
                      <Button onClick={startImport}>
                        Start Import ({csvData.length} contacts)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="importing" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Importing Contacts</CardTitle>
                    <CardDescription>
                      Please wait while we process your contacts...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {importProgress.processed} of {importProgress.total}
                        </span>
                      </div>
                      <Progress
                        value={
                          (importProgress.processed / importProgress.total) *
                          100
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {importProgress.successful}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Successful
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {importProgress.failed}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Failed
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-2xl font-bold">
                          {importProgress.processed}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Processed
                        </div>
                      </div>
                    </div>

                    {importProgress.errors.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Import Errors:
                        </Label>
                        <ScrollArea className="h-32 rounded border p-2">
                          {importProgress.errors.map((error, index) => (
                            <div
                              key={index}
                              className="mb-1 text-sm text-red-600"
                            >
                              Row {error.row}: {error.error}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="complete" className="mt-0 space-y-6">
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>Import Complete!</CardTitle>
                    <CardDescription>
                      Your contacts have been successfully imported
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {importProgress.successful}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Contacts Added
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {importProgress.failed}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Failed Imports
                        </div>
                      </div>
                    </div>

                    {importProgress.failed > 0 && (
                      <Alert>
                        <AlertTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          {importProgress.failed} contacts failed to import.
                          Check the error details above and consider
                          re-importing those records after fixing the issues.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-center">
                      <Button onClick={handleClose}>Done</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
