// app/organization/[id]/segments/page.tsx

import { Suspense } from "react";

import { SegmentsHeader } from "@/components/segments/segments-header";
import { SegmentsList } from "@/components/segments/segments-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getFirstAudienceListId } from "@/lib/actions/audience-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

function SegmentsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="bg-muted h-4 w-3/4 rounded"></div>
            <div className="bg-muted h-3 w-1/2 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-muted h-3 w-full rounded"></div>
              <div className="bg-muted h-3 w-2/3 rounded"></div>
              <div className="bg-muted h-3 w-1/2 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function OrganizationSegmentsPage({ params }: PageProps) {
  const { id: orgId } = await params;
  const audienceListId = await getFirstAudienceListId(orgId);
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <SegmentsHeader orgId={orgId} />
      <div className="space-y-4">
        <Suspense fallback={<SegmentsLoadingSkeleton />}>
          <SegmentsList orgId={orgId} audienceListId={audienceListId} />
        </Suspense>
      </div>
    </div>
  );
}
