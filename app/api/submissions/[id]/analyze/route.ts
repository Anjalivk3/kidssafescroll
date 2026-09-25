import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeContent  } from "@/lib/ai/safetyAnalyzer";
import { decideSafety } from "@/lib/safety/decisionEngine";

import {
  SubmissionStatus,
} from "@/app/generated/prisma/enums";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /*
     * 1. Check authentication
     */
    const user = await getCurrentUser();
console.log("ANALYZE USER:", user);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    /*
     * 2. Get submission ID
     */
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

    /*
     * 3. Find submission belonging to logged-in user
     */
    const submission = await prisma.contentSubmission.findFirst({
      where: {
        id: submissionId,
        userId: user.id,
      },

      include: {
        child: {
          include: {
            safetyPolicy: true,
          },
        },

        analysis: true,
      },
    });

    console.log("ANALYZE FOUND SUBMISSION:", submission);

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found",
        },
        { status: 404 }
      );
    }

    /*
     * 4. Prevent unnecessary re-analysis
     */
    if (submission.status === SubmissionStatus.ANALYZED) {
      return NextResponse.json(
        {
          success: false,
          message: "This submission has already been analyzed.",
          analysis: submission.analysis,
        },
        { status: 409 }
      );
    }

    /*
     * 5. Child must have a safety policy
     */
    if (!submission.child.safetyPolicy) {
      return NextResponse.json(
        {
          success: false,
          message: "Safety policy not found for this child.",
        },
        { status: 400 }
      );
    }

    /*
     * 6. Mark submission as pending
     */
    await prisma.contentSubmission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: SubmissionStatus.PENDING,
      },
    });

    /*
     * 7. Send content to AI
     */
    const aiResult = await analyzeContent({
  title: submission.title ?? "",
  description: submission.description ?? undefined,
  transcript: submission.transcript ?? undefined,
  imageUrl: submission.imageUrl ?? undefined,
});

    /*
     * 8. Run deterministic decision engine
     */
    const decision = decideSafety({
      riskLevel: aiResult.riskLevel,
      score: aiResult.score,
      detectedCategories: aiResult.detectedCategories,
      policy: submission.child.safetyPolicy,
    });

    /*
     * 9. Save AI analysis + application decision
     */
    const analysis = await prisma.safetyAnalysis.upsert({
      where: {
        submissionId: submission.id,
      },

      update: {
        riskLevel: aiResult.riskLevel,
        score: aiResult.score,
        explanation: `${aiResult.explanation} Decision: ${decision.reason}`,
        recommendation: decision.recommendation,
        detectedCategories: aiResult.detectedCategories,
      },

      create: {
        submissionId: submission.id,
        riskLevel: aiResult.riskLevel,
        score: aiResult.score,
        explanation: `${aiResult.explanation} Decision: ${decision.reason}`,
        recommendation: decision.recommendation,
        detectedCategories: aiResult.detectedCategories,
      },
    });

    /*
     * 10. Mark submission as analyzed
     */
    await prisma.contentSubmission.update({
      where: {
        id: submission.id,
      },

      data: {
        status: SubmissionStatus.ANALYZED,
      },
    });

    /*
     * 11. Return final result
     */
    return NextResponse.json({
      success: true,

      message: "Content analyzed successfully",

      result: {
        submissionId: submission.id,

        child: {
          id: submission.child.id,
          name: submission.child.name,
          age: submission.child.age,
        },

        ai: {
          riskLevel: aiResult.riskLevel,
          score: aiResult.score,
          explanation: aiResult.explanation,
          detectedCategories: aiResult.detectedCategories,
        },

        policyDecision: {
          recommendation: decision.recommendation,
          reason: decision.reason,
        },

        analysis,
      },
    });
  } catch (error) {
    console.error("Safety analysis error:", error);

    /*
     * Try to mark submission as ERROR
     */
    try {
      const { id } = await context.params;

      const submissionId = Number(id);
console.log("ANALYZE SUBMISSION ID:", submissionId);
      if (Number.isInteger(submissionId)) {
        await prisma.contentSubmission.updateMany({
          where: {
            id: submissionId,
          },
          data: {
            status: SubmissionStatus.ERROR,
          },
        });
      }
    } catch (updateError) {
      console.error(
        "Could not update submission status:",
        updateError
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Safety analysis failed",
      },
      { status: 500 }
    );
  }
}