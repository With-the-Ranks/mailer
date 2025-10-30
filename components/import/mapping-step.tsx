"use client";

import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { FieldMapping } from "@/lib/types";

import { MappingFieldsList } from "./MappingFieldsList";

interface MappingStepProps {
  fieldMappings: FieldMapping[];
  csvHeaders: string[];
  canProceedFromMapping: boolean;
  onMappingChange: (contactField: string, csvColumn: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function MappingStep({
  fieldMappings = [],
  csvHeaders = [],
  canProceedFromMapping,
  onMappingChange,
  onBack,
  onNext,
}: MappingStepProps) {
  return (
    <Tabs value="mapping" className="flex h-full min-h-0 flex-1 flex-col">
      <TabsContent
        value="mapping"
        className="flex h-full min-h-0 flex-1 flex-col"
      >
        <Card className="flex h-[70vh] max-h-[700px] flex-col overflow-hidden">
          <CardHeader className="shrink-0 px-8 pb-2 pt-6">
            <CardTitle className="text-xl">
              Map CSV Columns to Contact Fields
            </CardTitle>
            <CardDescription className="mt-1 text-base">
              We&apos;ve automatically detected and mapped common fields. Review
              and adjust as needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            {/* SCROLLABLE MAPPING FIELDS */}
            <ScrollArea className="max-h-[400px] min-h-0 flex-1 px-8 py-2">
              <MappingFieldsList
                fieldMappings={fieldMappings}
                csvHeaders={csvHeaders}
                handleMappingChange={onMappingChange}
              />
            </ScrollArea>
            {/* STICKY FOOTER */}
            <div className="border-t bg-background px-8 pb-6 pt-4">
              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Unmapped CSV columns will be automatically added as custom
                  fields. Required fields (marked with *) must be mapped to
                  proceed.
                </AlertDescription>
              </Alert>
              <div className="flex justify-between">
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button onClick={onNext} disabled={!canProceedFromMapping}>
                  Preview Import
                  {!canProceedFromMapping && (
                    <span className="ml-2 text-xs">(Map required fields)</span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
