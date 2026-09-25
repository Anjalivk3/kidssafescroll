import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


const updateChildSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Child name must be at least 2 characters"),

  age: z
    .number()
    .int("Age must be a whole number")
    .min(0)
    .max(18),
});


// ==========================================
// UPDATE CHILD
// ==========================================

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

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


    // 2. Get child ID
    const { id } = await params;

    const childId = Number(id);

    if (!Number.isInteger(childId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid child ID",
        },
        { status: 400 }
      );
    }


    // 3. Validate body
    const body = await request.json();

    const result = updateChildSchema.safeParse(body);

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


    // 4. Check ownership
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


    // 5. Update
    const updatedChild = await prisma.child.update({
      where: {
        id: childId,
      },

      data: {
        name: result.data.name,
        age: result.data.age,
      },

      include: {
        safetyPolicy: true,
      },
    });


    return NextResponse.json({
      success: true,
      message: "Child updated successfully",
      child: updatedChild,
    });

  } catch (error) {

    console.error("Update child error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update child",
      },
      { status: 500 }
    );
  }
}


// ==========================================
// DELETE CHILD
// ==========================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

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


    // 2. Get ID
    const { id } = await params;

    const childId = Number(id);

    if (!Number.isInteger(childId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid child ID",
        },
        { status: 400 }
      );
    }


    // 3. Make sure this child belongs to this parent
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


    // 4. Delete
    // SafetyPolicy + ContentSubmission will be
    // deleted because our schema uses onDelete: Cascade.
    await prisma.child.delete({
      where: {
        id: childId,
      },
    });


    return NextResponse.json({
      success: true,
      message: "Child deleted successfully",
    });

  } catch (error) {

    console.error("Delete child error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete child",
      },
      { status: 500 }
    );
  }
}