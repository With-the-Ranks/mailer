import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Authentication constants
export const TOTP_CODE_LENGTH = 6;
export const TOTP_TIME_WINDOW = 2;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const response = await fetch(input, { ...init, cache: "no-store" });

  return response.json();
}

export const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const truncate = (str: string, num: number) => {
  if (!str) return "";
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};

export const getBlurDataURL = async (url: string | null) => {
  if (!url) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }
  try {
    const response = await fetch(
      `https://wsrv.nl/?url=${url}&w=50&h=50&blur=5`,
    );
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }
};

export const placeholderBlurhash =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg==";

export const toDateString = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const isErrorResponse = (
  response: any,
): response is { error: string } => {
  return response && typeof response === "object" && "error" in response;
};

export function isSafari() {
  if (typeof window === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function buildAudienceWhere(
  audienceListId: string,
  filterCriteria: Record<string, any>,
) {
  const where: any = { audienceListId, isUnsubscribed: false }; // Exclude unsubscribed contacts by default

  // List of built-in fields
  const BUILT_IN_KEYS = new Set([
    "searchValue",
    "tags",
    "defaultAddressCountryCode",
    "defaultAddressProvinceCode",
    "defaultAddressCompany",
    "defaultAddressCity",
    "defaultAddressZip",
    "defaultAddressPhone",
    // Add more as needed
  ]);

  // Search (multi-field)
  if (filterCriteria?.searchValue && filterCriteria.searchValue.trim() !== "") {
    const search = filterCriteria.searchValue.trim();
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { note: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
      { defaultAddressCompany: { contains: search, mode: "insensitive" } },
      { defaultAddressAddress1: { contains: search, mode: "insensitive" } },
      { defaultAddressAddress2: { contains: search, mode: "insensitive" } },
      { defaultAddressCity: { contains: search, mode: "insensitive" } },
      { defaultAddressProvinceCode: { contains: search, mode: "insensitive" } },
      { defaultAddressCountryCode: { contains: search, mode: "insensitive" } },
      { defaultAddressZip: { contains: search, mode: "insensitive" } },
      { defaultAddressPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Built-in array filters (tags: contains; others: in)
  if (
    filterCriteria?.tags &&
    Array.isArray(filterCriteria.tags) &&
    filterCriteria.tags.length > 0
  ) {
    where.AND = (where.AND || []).concat(
      filterCriteria.tags.map((tag: string) => ({
        tags: { contains: tag },
      })),
    );
  }

  [
    "defaultAddressCountryCode",
    "defaultAddressProvinceCode",
    "defaultAddressCompany",
    "defaultAddressCity",
    "defaultAddressZip",
    "defaultAddressPhone",
  ].forEach((key) => {
    if (
      filterCriteria?.[key] &&
      Array.isArray(filterCriteria[key]) &&
      filterCriteria[key].length > 0
    ) {
      where[key] = { in: filterCriteria[key] };
    }
  });

  // Dynamic custom field filters (handles any non-built-in keys)
  Object.entries(filterCriteria).forEach(([key, value]) => {
    if (BUILT_IN_KEYS.has(key)) return;
    if (!Array.isArray(value) || value.length === 0) return;

    // OR filter: customFields.key == value for any value
    const orFilters = value.map((v) => ({
      customFields: {
        path: [key],
        equals: v,
      },
    }));

    where.AND = (where.AND || []).concat([{ OR: orFilters }]);
  });

  return where;
}

export function getBaseAppUrl() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://app.localhost:3000";
  return baseUrl;
}

export function getUnsubscribeUrl({
  email,
  listId,
  organizationId,
}: {
  email?: string | null;
  listId?: string | null;
  organizationId?: string | null;
}) {
  const baseUrl = getBaseAppUrl();

  const params = new URLSearchParams();

  if (email) params.set("email", email);
  if (listId) params.set("list", listId);
  if (organizationId) params.set("organization", organizationId);

  return `${baseUrl}/unsubscribe${params.size ? `?${params.toString()}` : ""}`;
}
