import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


// ==========================================
// VALIDATION
// ==========================================

const submissionSchema = z.object({
  childId: z
    .number()
    .int("Child ID must be a whole number")
    .positive("Invalid child ID"),

  url: z
    .string()
    .trim()
    .url("Please provide a valid URL"),

  title: z
    .string()
    .trim()
    .max(200, "Title is too long")
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional(),

  transcript: z
    .string()
    .trim()
    .max(20000, "Transcript is too long")
    .optional(),

  imageUrl: z
    .string()
    .trim()
    .url("Image URL must be valid")
    .optional(),
});


// ==========================================
// POST /api/submissions
// ==========================================

export async function POST(request: Request) {

  try {

    // --------------------------------------
    // 1. Check authentication
    // --------------------------------------

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


    // --------------------------------------
    // 2. Read request body
    // --------------------------------------

    const body = await request.json();


    // --------------------------------------
    // 3. Validate request
    // --------------------------------------

    const result = submissionSchema.safeParse(body);

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


    const {
      childId,
      url,
      title,
      description,
      transcript,
      imageUrl,
    } = result.data;


    // --------------------------------------
    // 4. Verify child belongs to this parent
    // --------------------------------------

    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        userId: user.id,
      },
    });


    if (!child) {

      return NextResponse.json(
        {
          success: false,
          message: "Child not found",
        },
        { status: 404 }
      );

    }


    // --------------------------------------
    // 5. Create submission
    // --------------------------------------

    const submission = await prisma.contentSubmission.create({

      data: {
        userId: user.id,
        childId,

        url,

        title: title || null,

        description: description || null,

        transcript: transcript || null,

        imageUrl: imageUrl || null,

        status: "PENDING",
      },

      include: {
        child: {
          select: {
            id: true,
            name: true,
            age: true,
          },
        },
      },

    });


    // --------------------------------------
    // 6. Return response
    // --------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Content submitted successfully",
        submission,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error("Create submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit content",
      },
      { status: 500 }
    );

  }
}


// ==========================================
// GET /api/submissions
// ==========================================

export async function GET() {

  try {

    // 1. Authenticate
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


    // 2. Get submissions belonging to this parent
    const submissions = await prisma.contentSubmission.findMany({

      where: {
        userId: user.id,
      },

      include: {
        child: {
          select: {
            id: true,
            name: true,
            age: true,
          },
        },

        analysis: true,
      },

      orderBy: {
        createdAt: "desc",
      },

    });


    return NextResponse.json({
      success: true,
      submissions,
    });


  } catch (error) {

    console.error("Get submissions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get submissions",
      },
      { status: 500 }
    );

  }
}