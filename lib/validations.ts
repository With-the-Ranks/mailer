import { z } from "zod";

export const contactSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  phone: z.string().optional().nullable(),
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
  customFields: z.record(z.any()).optional().default({}),
  audienceListId: z.string().min(1, "Audience list ID is required"),
  isUnsubscribed: z.boolean().optional(),
  unsubscribedAt: z.string().optional().nullable(),
  unsubscribeReason: z.string().optional().nullable(),
});

export const updateContactSchema = contactSchema
  .partial()
  .omit({ audienceListId: true });

export const segmentSchema = z.object({
  name: z.string().min(1, "Segment name is required").trim(),
  description: z.string().optional().nullable(),
  audienceListId: z.string().min(1, "Audience list ID is required"),
  filterCriteria: z.record(z.any()).optional().default({}),
  contactIds: z.array(z.string()).optional().default([]),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type SegmentInput = z.infer<typeof segmentSchema>;
