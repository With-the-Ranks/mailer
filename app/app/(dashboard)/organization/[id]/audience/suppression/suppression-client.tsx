"use client";

import {
  AlertTriangle,
  Ban,
  Mail,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SuppressionEntry {
  id: string;
  email: string;
  reason: string;
  sourceEmail: string | null;
  createdAt: string;
}

interface SuppressionStats {
  total: number;
  bounced: number;
  complained: number;
  manual: number;
}

interface SuppressionClientProps {
  organizationId: string;
  suppressionList: SuppressionEntry[];
  stats: SuppressionStats;
}

function getReasonLabel(reason: string): string {
  switch (reason) {
    case "HARD_BOUNCE":
      return "Hard Bounce";
    case "COMPLAINT":
      return "Complaint";
    case "MANUAL":
      return "Manually Added";
    default:
      return reason;
  }
}

function getReasonColor(reason: string): string {
  switch (reason) {
    case "HARD_BOUNCE":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "COMPLAINT":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "MANUAL":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    default:
      return "bg-stone-100 text-stone-700 dark:bg-[#252525] dark:text-stone-300";
  }
}

export default function SuppressionClient({
  organizationId,
  suppressionList,
  stats,
}: SuppressionClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const filteredList = suppressionList.filter((entry) =>
    entry.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async () => {
    if (!newEmail.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/suppression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          reason: "MANUAL",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add email");
      }

      toast.success("Email added to suppression list");
      setNewEmail("");
      setShowAddModal(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add email",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${email} from the suppression list? This will allow emails to be sent to this address again.`,
      )
    ) {
      return;
    }

    setIsRemoving(id);
    try {
      const response = await fetch(`/api/suppression?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove email");
      }

      toast.success("Email removed from suppression list");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove email",
      );
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          Suppression List
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Emails on this list will not receive any messages. Hard bounces and
          spam complaints are automatically added.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 dark:bg-[#252525]">
              <Ban className="h-5 w-5 text-stone-600 dark:text-stone-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Total Suppressed
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
              <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                {stats.bounced}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Hard Bounces
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                {stats.complained}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Complaints
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#2D2D2D]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                {stats.manual}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Manually Added
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Add Email
        </button>
      </div>

      {/* Suppression List Table */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-[#2D2D2D]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-stone-500 dark:text-stone-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-stone-500 dark:text-stone-400">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-stone-500 dark:text-stone-400">
                  Added
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-stone-500 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400"
                  >
                    {search
                      ? "No emails found matching your search"
                      : "No emails in suppression list"}
                  </td>
                </tr>
              ) : (
                filteredList.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-stone-100 dark:border-stone-700"
                  >
                    <td className="px-4 py-3 text-sm text-stone-900 dark:text-white">
                      {entry.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getReasonColor(entry.reason)}`}
                      >
                        {getReasonLabel(entry.reason)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(entry.id, entry.email)}
                        disabled={isRemoving === entry.id}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isRemoving === entry.id ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
        <h3 className="font-medium text-blue-900 dark:text-blue-300">
          How the suppression list works
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
          <li>
            • <strong>Hard Bounces:</strong> Automatically added when an email
            permanently fails to deliver
          </li>
          <li>
            • <strong>Complaints:</strong> Automatically added when a recipient
            marks your email as spam
          </li>
          <li>
            • <strong>Manual:</strong> You can manually add emails to prevent
            sending to specific addresses
          </li>
          <li>
            • Emails on this list will be skipped when sending campaigns,
            protecting your sender reputation
          </li>
        </ul>
      </div>

      {/* Add Email Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-[#2D2D2D]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                Add to Suppression List
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
              Enter an email address to prevent sending emails to this
              recipient.
            </p>

            <input
              type="email"
              placeholder="email@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="mb-4 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-stone-600 dark:bg-[#2D2D2D] dark:text-white"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newEmail.trim() || isAdding}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
              >
                {isAdding ? "Adding..." : "Add to List"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
