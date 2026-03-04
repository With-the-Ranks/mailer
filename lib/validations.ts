import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalString = z.string().optional().nullable();
const requiredEmail = z
  .string()
  .trim()
  .min(1, "Email is required")
  .refine((value) => emailRegex.test(value), "Invalid email address");
const updatableEmail = z
  .string()
  .optional()
  .refine((value) => {
    if (value == null) return true;
    const trimmed = value.trim();
    return trimmed.length > 0 && emailRegex.test(trimmed);
  }, "Invalid email address");

export function hasPrimaryContactIdentifier(input: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  const hasName = Boolean(input.firstName?.trim() || input.lastName?.trim());
  const hasEmail = Boolean(input.email?.trim());
  const hasPhone = Boolean(input.phone?.trim());
  return hasName || hasEmail || hasPhone;
}

export const contactSchema = z
  .object({
    email: requiredEmail,
    firstName: optionalString,
    lastName: optionalString,
    phone: optionalString,
    note: z.string().optional().nullable(),
    tags: z.string().optional().nullable(),
    defaultAddressCompany: z.string().optional().nullable(),
    defaultAddressAddress1: z.string().optional().nullable(),
    defaultAddressAddress2: z.string().optional().nullable(),
    defaultAddressCity: z.string().optional().nullable(),
    defaultAddressProvinceCode: z.string().optional().nullable(),
    defaultAddressCountryCode: z.string().optional().nullable(),
    defaultAddressZip: z.string().optional().nullable(),
    defaultAddressPhone: z.string().optional().nullable(),
    customFields: z.record(z.string(), z.any()).optional().default({}),
    audienceListId: z.string().min(1, "Audience list ID is required"),
    isUnsubscribed: z.boolean().optional(),
    unsubscribedAt: z.string().optional().nullable(),
    unsubscribeReason: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!hasPrimaryContactIdentifier(data)) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "At least one of name, email, or phone is required",
      });
    }
  });

export const updateContactSchema = z.object({
  email: updatableEmail,
  firstName: optionalString,
  lastName: optionalString,
  phone: optionalString,
  note: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  defaultAddressCompany: z.string().optional().nullable(),
  defaultAddressAddress1: z.string().optional().nullable(),
  defaultAddressAddress2: z.string().optional().nullable(),
  defaultAddressCity: z.string().optional().nullable(),
  defaultAddressProvinceCode: z.string().optional().nullable(),
  defaultAddressCountryCode: z.string().optional().nullable(),
  defaultAddressZip: z.string().optional().nullable(),
  defaultAddressPhone: z.string().optional().nullable(),
  customFields: z.record(z.string(), z.any()).optional(),
  isUnsubscribed: z.boolean().optional(),
  unsubscribedAt: z.string().optional().nullable(),
  unsubscribeReason: z.string().optional().nullable(),
});

export const segmentSchema = z.object({
  name: z.string().min(1, "Segment name is required").trim(),
  description: z.string().optional().nullable(),
  audienceListId: z.string().min(1, "Audience list ID is required"),
  filterCriteria: z.record(z.string(), z.any()).optional().default({}),
  contactIds: z.array(z.string()).optional().default([]),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type SegmentInput = z.infer<typeof segmentSchema>;
