import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decideContentAccess } from "@/lib/safety/accessDecision";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ---------------------------------------
    // 1. Authenticate parent/user
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
    // 2. Get submission ID
    // ---------------------------------------

    const { id } = await context.params;

    const submissionId = Number(id);

    if (!Number.isInteger(submissionId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid submission ID",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------
    // 3. Find user's submission
    // ---------------------------------------

    const submission =
      await prisma.contentSubmission.findFirst({
        where: {
          id: submissionId,
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

          analysis: {
            select: {
              riskLevel: true,
              score: true,
              explanation: true,
              recommendation: true,
              detectedCategories: true,
            },
          },
        },
      });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Content not found",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------
    // 4. Calculate access decision
    // ---------------------------------------

    const access = decideContentAccess({
      status: submission.status,
      aiRecommendation:
        submission.analysis
          ?.recommendation ?? null,

      parentDecision:
        submission.parentDecision,
    });

    // ---------------------------------------
    // 5. Return decision
    // ---------------------------------------

    return NextResponse.json({
      success: true,

      access: {
        decision: access.decision,
        reason: access.reason,
      },

      content: {
        id: submission.id,
        title: submission.title,
        url: submission.url,
        status: submission.status,

        child: submission.child,

        aiRecommendation:
          submission.analysis
            ?.recommendation ?? null,

        parentDecision:
          submission.parentDecision,

        analysis:
          submission.analysis,
      },
    });
  } catch (error) {
    console.error(
      "Content access error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to determine content access.",
      },
      { status: 500 }
    );
  }
}