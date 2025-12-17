"use client";

import { AlertTriangleIcon, CheckCircleIcon } from "lucide-react";

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
import type { ImportProgress } from "@/lib/types";

interface CompleteStepProps {
  importProgress: ImportProgress;
  onClose: () => void;
}

export function CompleteStep({ importProgress, onClose }: CompleteStepProps) {
  return (
    <Tabs value="complete">
      <TabsContent
        value="complete"
        className="mt-0 h-full space-y-6 overflow-auto"
      >
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
                <div className="text-muted-foreground text-base">
                  Contacts Added
                </div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {importProgress.failed}
                </div>
                <div className="text-muted-foreground text-base">
                  Failed Imports
                </div>
              </div>
            </div>
            {importProgress.failed > 0 && (
              <Alert>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  {importProgress.failed} contacts failed to import. Check the
                  error details above and consider re-importing those records
                  after fixing the issues.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-center">
              <Button onClick={onClose}>Done</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
