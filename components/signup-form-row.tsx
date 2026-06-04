"use client";

import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { EmbedCodeDialog } from "@/components/embed-code-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SignupFormRowProps {
  data: any; // SignupForm with _count
}

export default function SignupFormRow({ data }: SignupFormRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this signup form?")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/signup-forms/${data.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Error deleting signup form:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCopyUrl = async () => {
    const baseUrl = window.location.origin;
    const signupUrl = `${baseUrl}/app/signup-forms/${data.slug}`;

    try {
      await navigator.clipboard.writeText(signupUrl);
      toast.success("Signup URL copied to clipboard!");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = signupUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Signup URL copied to clipboard!");
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-gray-100 text-gray-800 dark:bg-[#2D2D2D] dark:text-gray-200"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const editUrl = `/organization/${data.organizationId}/signup-forms/${data.id}/edit`;

  const handleRowClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Don't navigate if clicking on buttons or links
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest('[role="menuitem"]')
    ) {
      return;
    }
    router.push(editUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick(e);
    }
  };

  return (
    <tr
      key={data.id}
      role="button"
      tabIndex={0}
      className="cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset dark:hover:bg-neutral-800"
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
    >
      <td className="min-w-0 px-3 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <div className="truncate text-base font-medium text-gray-900 dark:text-white">
            {data.name}
          </div>
          <div className="truncate text-sm text-gray-500 dark:text-gray-400">
            /{data.slug}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-center whitespace-nowrap sm:px-6 sm:py-4">
        {getStatusBadge(data.isActive)}
      </td>
      <td className="px-3 py-3 text-center text-base whitespace-nowrap text-gray-900 sm:px-6 sm:py-4 dark:text-white">
        {data._count?.submissions || 0}
      </td>
      <td className="px-3 py-3 text-center text-base whitespace-nowrap text-gray-500 sm:px-6 sm:py-4 dark:text-gray-400">
        {formatDate(data.createdAt)}
      </td>
      <td className="px-3 py-3 text-right text-base font-medium sm:px-6 sm:py-4">
        <div
          className="flex flex-wrap items-center justify-end gap-1 sm:gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/signup-forms/${data.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            title="Copy signup URL"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <EmbedCodeDialog formSlug={data.slug} formName={data.name} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={editUrl}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
