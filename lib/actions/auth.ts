"use server";

import { hash } from "bcrypt";

import prisma from "@/lib/prisma";

// User registration function
export const registerUser = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const hashedPassword = await hash(password, 10);

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists." };
    }

    // Extract default name from email
    const defaultName = email.split("@")[0];

    // Using Prisma to create a new user in the 'User' table
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: defaultName, // Set the default name
      },
    });

    return { message: "success", user: { email: user.email, id: user.id } };
  } catch (e: any) {
    return { error: "Error creating user.", details: e.message };
  }
};
