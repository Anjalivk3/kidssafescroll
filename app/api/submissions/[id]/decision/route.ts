import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  ParentDecision,
  SubmissionStatus,
} from "@/app/generated/prisma/enums";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ---------------------------------------
    // 1. Check authentication
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
    // 3. Read parent decision
    // ---------------------------------------

    const body = await request.json();

    const { decision } = body;

    // ---------------------------------------
    // 4. Validate decision
    // ---------------------------------------

    const allowedDecisions = Object.values(ParentDecision);

    if (!allowedDecisions.includes(decision)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid decision. Use ALLOWED, RESTRICTED or REVIEW.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------
    // 5. Find submission belonging to user
    // ---------------------------------------

    const submission =
      await prisma.contentSubmission.findFirst({
        where: {
          id: submissionId,
          userId: user.id,
        },

        include: {
          child: true,
          analysis: true,
        },
      });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------
    // 6. Content should be analyzed first
    // ---------------------------------------

    if (
      submission.status !==
      SubmissionStatus.ANALYZED
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Content must be analyzed before making a parent decision.",
        },
        { status: 400 }
      );
    }

    if (!submission.analysis) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Safety analysis not found.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------
    // 7. Save parent's final decision
    // ---------------------------------------

    const updatedSubmission =
      await prisma.contentSubmission.update({
        where: {
          id: submission.id,
        },

        data: {
          parentDecision: decision,
        },

        include: {
          child: true,
          analysis: true,
        },
      });

    // ---------------------------------------
    // 8. Return response
    // ---------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Parent decision saved successfully.",

      submission: {
        id: updatedSubmission.id,
        title: updatedSubmission.title,
        url: updatedSubmission.url,

        child: {
          id: updatedSubmission.child.id,
          name: updatedSubmission.child.name,
          age: updatedSubmission.child.age,
        },

        aiRecommendation:
          updatedSubmission.analysis
            ?.recommendation,

        parentDecision:
          updatedSubmission.parentDecision,

        analysis: updatedSubmission.analysis,
      },
    });
  } catch (error) {
    console.error(
      "Parent decision error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save parent decision.",
      },
      { status: 500 }
    );
  }
}