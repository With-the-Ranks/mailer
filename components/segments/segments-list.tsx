"use client";

import {
  CopyIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Segment {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  filterCriteria: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  audienceList: {
    id: string;
    name: string;
  };
  organizationId: string;
}

export function SegmentsList({
  orgId,
  audienceListId,
}: {
  orgId: string;
  audienceListId?: string;
}) {
  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [segmentToDelete, setSegmentToDelete] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    loadSegments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const loadSegments = async () => {
    try {
      const response = await fetch(`/api/segments?organizationId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setSegments(data);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load segments");
      }
    } catch (error) {
      console.error("Failed to load segments:", error);
      toast.error("Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegmentToDelete(segmentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSegment = async () => {
    if (!segmentToDelete) return;

    try {
      const response = await fetch(`/api/segments/${segmentToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSegments((prev) => prev.filter((s) => s.id !== segmentToDelete));
        toast.success("Segment deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete segment");
      }
    } catch (error) {
      console.error("Failed to delete segment:", error);
      toast.error("Failed to delete segment");
    } finally {
      setDeleteDialogOpen(false);
      setSegmentToDelete(null);
    }
  };

  const handleDuplicateSegment = async (segment: Segment) => {
    try {
      const response = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${segment.name} (Copy)`,
          description: segment.description,
          audienceListId: segment.audienceList.id,
          filterCriteria: segment.filterCriteria,
          organizationId: orgId,
        }),
      });

      if (response.ok) {
        const newSegment = await response.json();
        setSegments((prev) => [newSegment, ...prev]);
        toast.success("Segment duplicated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to duplicate segment");
      }
    } catch (error) {
      console.error("Failed to duplicate segment:", error);
      toast.error("Failed to duplicate segment");
    }
  };

  const getFilterSummary = (filterCriteria: Record<string, any>) => {
    const summary = [];

    if (filterCriteria.searchValue) {
      summary.push(`Search: "${filterCriteria.searchValue}"`);
    }

    if (filterCriteria.tags?.length > 0) {
      summary.push(`Tags: ${filterCriteria.tags.join(", ")}`);
    }

    if (filterCriteria.countries?.length > 0) {
      summary.push(`Countries: ${filterCriteria.countries.join(", ")}`);
    }

    if (filterCriteria.organizations?.length > 0) {
      summary.push(`Organizations: ${filterCriteria.organizations.join(", ")}`);
    }

    if (filterCriteria.precincts?.length > 0) {
      summary.push(`Precincts: ${filterCriteria.precincts.join(", ")}`);
    }

    if (filterCriteria.dateRange && filterCriteria.dateRange !== "all") {
      summary.push(`Date Range: ${filterCriteria.dateRange}`);
    }

    return summary;
  };

  if (loading) {
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
  if (segments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UsersIcon className="text-muted-foreground mb-4 h-16 w-16" />
          <h3 className="mb-2 text-xl font-semibold">No segments yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md text-center">
            Create segments by filtering your contacts in audience lists and
            clicking &quot;Create Segment&quot;
          </p>
          <Button asChild>
            <Link
              href={
                audienceListId ? `/audience/${audienceListId}` : "/audience"
              }
            >
              {" "}
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Your First Segment
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => {
          const filterSummary = getFilterSummary(segment.filterCriteria);

          return (
            <Card
              key={segment.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/segments/${segment.id}/`}
                      prefetch={false}
                      className="block h-full"
                      tabIndex={-1}
                    >
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {segment.audienceList.name}
                      </CardDescription>
                    </Link>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/segments/${segment.id}/`}
                          prefetch={false}
                        >
                          <UsersIcon className="mr-2 h-4 w-4" />
                          View Contacts
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicateSegment(segment)}
                      >
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteSegment(segment.id)}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {segment.description && (
                  <p className="text-muted-foreground text-sm">
                    {segment.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <UsersIcon className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">
                    {segment.contactCount} contacts
                  </span>
                </div>

                {filterSummary.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FilterIcon className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm font-medium">
                        Applied Filters
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {filterSummary.slice(0, 2).map((filter, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {filter.length > 25
                            ? `${filter.substring(0, 25)}...`
                            : filter}
                        </Badge>
                      ))}
                      {filterSummary.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{filterSummary.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>
                    Created {new Date(segment.createdAt).toLocaleDateString()}
                  </span>
                  {segment.updatedAt !== segment.createdAt && (
                    <span>
                      Updated {new Date(segment.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Segment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this segment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSegment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
