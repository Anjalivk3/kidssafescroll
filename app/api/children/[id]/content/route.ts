import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ---------------------------------------
    // 1. Authentication
    // ---------------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------
    // 2. Child ID
    // ---------------------------------------

    const { id } = await context.params;

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

    // ---------------------------------------
    // 3. Verify child belongs to user
    // ---------------------------------------

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

    // ---------------------------------------
    // 4. Get child's submissions
    // ---------------------------------------

    const submissions =
      await prisma.contentSubmission.findMany({
        where: {
          childId,
          userId: user.id,
        },

        include: {
          analysis: {
            select: {
              riskLevel: true,
              score: true,
              recommendation: true,
              detectedCategories: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ---------------------------------------
    // 5. Return content
    // ---------------------------------------

    return NextResponse.json({
      success: true,

      child: {
        id: child.id,
        name: child.name,
        age: child.age,
      },

      submissions,
    });
  } catch (error) {
    console.error(
      "Child content error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load child content.",
      },
      { status: 500 }
    );
  }
}