"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { SegmentDropdown } from "@/components/segment-dropdown";
import { useWizard } from "./wizard-context";

export function Step2Target() {
  const { formData, updateFormData, organizationId } = useWizard();
  const [contactCount, setContactCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [audienceListId, setAudienceListId] = useState<string | null>(null);

  // Fetch audience list ID
  useEffect(() => {
    const fetchAudienceListId = async () => {
      if (!organizationId) return;

      try {
        const response = await fetch(
          `/api/audience-list?organizationId=${organizationId}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            setAudienceListId(data.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch audience list ID:", error);
      }
    };

    fetchAudienceListId();
  }, [organizationId]);

  // Fetch contact count for selected segment
  useEffect(() => {
    const fetchContactCount = async () => {
      if (!organizationId) return;

      setLoading(true);
      try {
        const url = formData.selectedSegment
          ? `/api/segments/${formData.selectedSegment}/count`
          : `/api/audience?organizationId=${organizationId}&count=true`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setContactCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch contact count:", error);
        setContactCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchContactCount();
  }, [formData.selectedSegment, organizationId]);

  return (
    <div className="flex flex-col">
      <div className="px-6 pb-6">
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select which segment or list to send this email to
            </p>
          </div>

          {/* Segment Dropdown */}
          <div className="flex flex-col gap-4">
            <label className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Segment
            </label>
            <SegmentDropdown
              value={formData.selectedSegment}
              onChange={(segmentId) =>
                updateFormData({ selectedSegment: segmentId })
              }
              organizationId={organizationId}
            />
          </div>

          {/* Contact Count Display */}
          {!loading && contactCount !== null && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Recipients
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {contactCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    contacts will receive this email
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading contact count...
              </p>
            </div>
          )}

          {/* Warning for zero contacts */}
          {!loading && contactCount === 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                ⚠️ No contacts found
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                The selected segment has no contacts. You won't be able to send
                this email.
              </p>
            </div>
          )}

          {/* Manage Lists Link */}
          {audienceListId && (
            <div className="pt-4">
              <Link
                href={`/audience/${audienceListId}`}
                className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Manage lists
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
