import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const hashedPassword = await hash(password, 10);

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ message: "error", error: "User already exists." }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Using Prisma to create a new user in the 'User' table
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return NextResponse.json({ message: "success" });
  } catch (e) {
    return new Response(JSON.stringify({ message: "error", error: "Error creating user." }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
