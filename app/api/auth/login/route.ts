import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth";


const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required"),
});


export async function POST(request: Request) {
  try {

    // 1. Read request body
    const body = await request.json();


    // 2. Validate input
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }


    const { email, password } = result.data;


    // 3. Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });


    // Don't reveal whether email exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }


    // 4. Compare password with hashed password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );


    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }


    // 5. Create authentication token
    const token = await createAuthToken(user.id);


    // 6. Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );


    // 7. Store token in secure HTTP-only cookie
    response.cookies.set({
      name: "auth_token",
      value: token,

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 24 * 7,
    });


    return response;

  } catch (error) {

    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in",
      },
      { status: 500 }
    );
  }
}