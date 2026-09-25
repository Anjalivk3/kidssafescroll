import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


// ==========================================
// VALIDATION
// ==========================================

const childSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Child name must be at least 2 characters"),

  age: z
    .number()
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(18, "Age must be 18 or below"),
});


// ==========================================
// GET /api/children
// ==========================================

export async function GET() {

  try {

    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }


    // 2. Get only this parent's children
    const children = await prisma.child.findMany({
      where: {
        userId: user.id,
      },

      include: {
        safetyPolicy: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });


    return NextResponse.json({
      success: true,
      children,
    });

  } catch (error) {

    console.error("Get children error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get children",
      },
      { status: 500 }
    );
  }
}


// ==========================================
// POST /api/children
// ==========================================

export async function POST(request: Request) {

  try {

    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }


    // 2. Read request body
    const body = await request.json();


    // 3. Validate
    const result = childSchema.safeParse(body);

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


    const { name, age } = result.data;


    // 4. Create child
    // Also create default safety policy automatically
    const child = await prisma.child.create({
      data: {
        name,
        age,

        user: {
          connect: {
            id: user.id,
          },
        },

        safetyPolicy: {
          create: {},
        },
      },

      include: {
        safetyPolicy: true,
      },
    });


    return NextResponse.json(
      {
        success: true,
        message: "Child profile created successfully",
        child,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error("Create child error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create child profile",
      },
      { status: 500 }
    );
  }
}