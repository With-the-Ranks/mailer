"use client";

import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this signup form?")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/signup-forms/${data.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting signup form:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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

  return (
    <tr key={data.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {data.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              /{data.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        {getStatusBadge(data.isActive)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
        {data._count?.submissions || 0}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(data.createdAt)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/signup-forms/${data.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/organization/${data.organizationId}/signup-forms/${data.id}/edit`}
                >
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
