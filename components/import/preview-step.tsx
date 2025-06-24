"use client";

import { InfoIcon } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { Contact } from "@/lib/types";

interface PreviewStepProps {
  previewData: Contact[];
  totalRecords: number;
  onBack: () => void;
  onStartImport: () => void;
}

export function PreviewStep({
  previewData,
  totalRecords,
  onBack,
  onStartImport,
}: PreviewStepProps) {
  return (
    <Tabs
      defaultValue="preview"
      className="mt-0 h-full space-y-6 overflow-auto"
    >
      <TabsContent
        value="preview"
        className="mt-0 h-full space-y-6 overflow-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Preview Import Data</CardTitle>
            <CardDescription>
              Review the first 5 records to ensure the mapping is correct
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {previewData.map((contact, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-4">
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
                        Object.keys(contact.customFields).length > 0 && (
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
                Ready to import {totalRecords} contacts. This process may take a
                few moments for large files.
              </AlertDescription>
            </Alert>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={onBack}>
                Back to Mapping
              </Button>
              <Button onClick={onStartImport}>
                Start Import ({totalRecords} contacts)
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
