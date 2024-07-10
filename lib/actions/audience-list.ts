"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

  try {
    const newAudience = await prisma.audience.create({
      data: {
        email,
        firstName,
        lastName,
        audienceListId,
      },
    });
    return newAudience;
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return { error: "Email already exists on the list." };
    }
    return { error: "Unable to add audience." };
  }
};
