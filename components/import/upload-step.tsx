"use client";

import { DownloadIcon, FileTextIcon, UploadIcon } from "lucide-react";
import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

interface UploadStepProps {
  file: File | null;
  csvData: string[][];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadSample: () => void;
}

export function UploadStep({
  file,
  csvData,
  fileInputRef,
  onFileUpload,
  onDownloadSample,
}: UploadStepProps) {
  return (
    <Tabs defaultValue="upload" className="mt-0 h-full space-y-6 overflow-auto">
      <TabsContent
        value="upload"
        className="mt-0 h-full space-y-6 overflow-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing your contact data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-8 text-center">
              <UploadIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your CSV file here</p>
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
                  onChange={onFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            {file && (
              <Alert>
                <FileTextIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)}{" "}
                  KB) - {csvData.length} records found
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Download our sample CSV template to see the expected format
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
              <Button variant="outline" onClick={onDownloadSample}>
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
