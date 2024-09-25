"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Custom Error Class for Handling Specific Errors
// class DuplicateError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = "DuplicateError";
//   }
// }

// Create an audience list
export const createAudienceList = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const organizationId = formData.get("organizationId") as string;

  try {
    const newList = await prisma.audienceList.create({
      data: {
        name,
        description,
        organizationId,
      },
    });
    return newList;
  } catch (error: any) {
    return { error: "Unable to create audience list" };
  }
};

// Add an individual audience
export const addAudience = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }

  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const audienceListId = formData.get("audienceListId") as string;

  // Get custom fields from formData as JSON or an empty object
  let customFields = {};
  const customFieldsRaw = formData.get("customFields");

  // Safely parse custom fields if it's a valid JSON string
  if (typeof customFieldsRaw === "string") {
    try {
      customFields = JSON.parse(customFieldsRaw);
    } catch (error) {
      return { error: "Invalid custom fields format" };
    }
  }

  try {
    const newAudience = await prisma.audience.create({
      data: {
        email,
        firstName,
        lastName,
        audienceListId,
        customFields,
      },
    });
    return newAudience;
  } catch (error: any) {
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("audienceListId_email")
    ) {
      return { error: "This email already exists in the audience list" };
    }
    return { error: "Unable to add audience." };
  }
};

// Add a custom field to an audience list
export const addCustomFieldToAudienceList = async (
  audienceListId: string,
  newField: string,
) => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: audienceListId },
    });

    if (!audienceList) {
      return { error: "Audience list not found" };
    }

    // Safely cast or check if customFields is an array
    const existingFields = Array.isArray(audienceList.customFields)
      ? (audienceList.customFields as string[])
      : [];

    // Add new field to customFields if it doesn't already exist
    if (existingFields.includes(newField)) {
      return { error: "Custom field already exists" };
    }

    // Update the AudienceList with the new custom field
    const updatedAudienceList = await prisma.audienceList.update({
      where: { id: audienceListId },
      data: {
        customFields: [...existingFields, newField], // Add the new custom field
      },
    });

    return updatedAudienceList;
  } catch (error) {
    return { error: "Unable to add custom field." };
  }
};

export const removeCustomFieldFromAudienceList = async (
  audienceListId: string,
  fieldToRemove: string,
) => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: audienceListId },
    });

    if (!audienceList) {
      return { error: "Audience list not found" };
    }

    const existingFields = Array.isArray(audienceList.customFields)
      ? (audienceList.customFields as string[])
      : [];

    // Filter out the field to remove
    const updatedFields = existingFields.filter(
      (field) => field !== fieldToRemove,
    );

    // Update the AudienceList with the remaining custom fields
    const updatedAudienceList = await prisma.audienceList.update({
      where: { id: audienceListId },
      data: {
        customFields: updatedFields,
      },
    });

    return updatedAudienceList;
  } catch (error) {
    return { error: "Unable to remove custom field." };
  }
};

// Update an individual audience
export const updateAudience = async (id: string, data: any) => {
  const { email, firstName, lastName, customFields } = data;

  try {
    const updatedAudience = await prisma.audience.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        customFields: customFields || {},
      },
    });
    return updatedAudience;
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return { error: "Email already exists." };
    }
    return { error: "Unable to update audience." };
  }
};

// Delete an individual audience
export const deleteAudience = async (id: string) => {
  try {
    await prisma.audience.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    return { error: "Unable to delete audience." };
  }
};

// Fetch all audiences
export const getAudiences = async (audienceListId: string) => {
  try {
    const audienceList = await prisma.audienceList.findUnique({
      where: { id: audienceListId },
      include: {
        audiences: true,
      },
    });

    if (!audienceList) {
      return { error: "Audience list not found." };
    }

    // Safely cast customFields to an array of strings
    const customFields = Array.isArray(audienceList.customFields)
      ? (audienceList.customFields as string[])
      : [];

    return {
      audiences: audienceList.audiences,
      customFields,
    };
  } catch (error: any) {
    return { error: "Unable to fetch audiences." };
  }
};
