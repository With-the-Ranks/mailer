"use server";

import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

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

    // Using Prisma to create a new user in the 'User' table
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return { message: "success", user: { email: user.email, id: user.id } };
  } catch (e: any) {
    return { error: "Error creating user.", details: e.message };
  }
};
