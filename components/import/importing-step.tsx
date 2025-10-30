"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ImportProgress } from "@/lib/types";

interface ImportingStepProps {
  importProgress: ImportProgress;
}

export function ImportingStep({ importProgress }: ImportingStepProps) {
  return (
    <Tabs value="importing" className="mt-0 h-full space-y-6 overflow-auto">
      <TabsContent
        value="importing"
        className="mt-0 h-full space-y-6 overflow-auto"
      >
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
                value={(importProgress.processed / importProgress.total) * 100}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importProgress.successful}
                </div>
                <div className="text-muted-foreground text-sm">Successful</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importProgress.failed}
                </div>
                <div className="text-muted-foreground text-sm">Failed</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">
                  {importProgress.processed}
                </div>
                <div className="text-muted-foreground text-sm">Processed</div>
              </div>
            </div>
            {importProgress.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Import Errors:</Label>
                <ScrollArea className="h-32 rounded-sm border p-2">
                  {importProgress.errors.map((error, index) => (
                    <div key={index} className="mb-1 text-sm text-red-600">
                      Row {error.row}: {error.error}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
