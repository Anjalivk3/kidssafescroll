import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


const policySchema = z.object({
  violence: z.boolean(),
  profanity: z.boolean(),
  adultContent: z.boolean(),
  dangerousBehavior: z.boolean(),
  drugs: z.boolean(),
  hateContent: z.boolean(),
  disturbingContent: z.boolean(),
  selfHarm: z.boolean(),
});


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


    // 3. Check that child belongs to parent
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


    // 4. Validate policy
    const body = await request.json();

    const result = policySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid safety policy",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }


    // 5. Update or create policy
    const policy = await prisma.safetyPolicy.upsert({

      where: {
        childId,
      },

      update: result.data,

      create: {
        childId,
        ...result.data,
      },

    });


    return NextResponse.json({
      success: true,
      message: "Safety policy updated successfully",
      policy,
    });

  } catch (error) {

    console.error("Update safety policy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update safety policy",
      },
      { status: 500 }
    );
  }
}