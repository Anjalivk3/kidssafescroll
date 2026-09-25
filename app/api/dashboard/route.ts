import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    /*
     * 1. Authentication
     */
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

    /*
     * 2. Get children
     */
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

    /*
     * 3. Get all submissions
     */
    const submissions =
      await prisma.contentSubmission.findMany({
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

    /*
     * 4. Calculate dashboard statistics
     */
    const totalContent = submissions.length;

    const safeCount = submissions.filter(
      (submission) =>
        submission.analysis?.recommendation === "ALLOW"
    ).length;

    const restrictedCount = submissions.filter(
      (submission) =>
        submission.analysis?.recommendation === "RESTRICT"
    ).length;

    const reviewCount = submissions.filter(
      (submission) =>
        submission.analysis?.recommendation === "REVIEW"
    ).length;

    const pendingCount = submissions.filter(
      (submission) =>
        submission.status === "PENDING"
    ).length;

    const errorCount = submissions.filter(
      (submission) =>
        submission.status === "ERROR"
    ).length;

    /*
     * 5. Return recent content
     */
    const recentSubmissions = submissions
  .slice(0, 10)
  .map((submission) => ({
    id: submission.id,

    title: submission.title,

    url: submission.url,

    status: submission.status,

    parentDecision:
      submission.parentDecision,

    child: submission.child,

    analysis: submission.analysis
      ? {
          riskLevel:
            submission.analysis.riskLevel,

          score:
            submission.analysis.score,

          recommendation:
            submission.analysis.recommendation,

          detectedCategories:
            submission.analysis
              .detectedCategories,

          explanation:
            submission.analysis.explanation,
        }
      : null,

    createdAt:
      submission.createdAt,
  }));

    /*
     * 6. Dashboard response
     */
    return NextResponse.json({
      success: true,

      stats: {
        children: children.length,
        totalContent,
        safe: safeCount,
        restricted: restrictedCount,
        review: reviewCount,
        pending: pendingCount,
        errors: errorCount,
      },

      children,

      recentSubmissions,
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard",
      },
      { status: 500 }
    );
  }
}