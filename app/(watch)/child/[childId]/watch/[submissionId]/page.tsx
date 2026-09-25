import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { decideContentAccess } from "@/lib/safety/accessDecision";
import { getYouTubeEmbedUrl } from "@/lib/utils/youtube";
import "./watch.css";

type PageProps = {
  params: Promise<{
    childId: string;
    submissionId: string;
  }>;
};

export default async function WatchPage({
  params,
}: PageProps) {
  // ---------------------------------------
  // 1. Get route parameters
  // ---------------------------------------

  const {
    childId: childIdParam,
    submissionId: submissionIdParam,
  } = await params;

  const childId = Number(childIdParam);
  const submissionId = Number(submissionIdParam);

  if (
    !Number.isInteger(childId) ||
    !Number.isInteger(submissionId)
  ) {
    notFound();
  }

  // ---------------------------------------
  // 2. Authenticate
  // ---------------------------------------

  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="watch-page">
        <div className="watch-message">
          <h1>Login Required</h1>

          <p>
            Please log in before accessing
            this content.
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------
  // 3. Find content
  //
  // IMPORTANT:
  // Verify BOTH:
  // - submission belongs to user
  // - submission belongs to requested child
  // ---------------------------------------

  const submission =
    await prisma.contentSubmission.findFirst({
      where: {
        id: submissionId,

        childId,

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

  // ---------------------------------------
  // 4. Content not found
  // ---------------------------------------

  if (!submission) {
    notFound();
  }

  // ---------------------------------------
  // 5. Determine access
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
  // 6. RESTRICTED
  // ---------------------------------------

  if (access.decision === "RESTRICT") {
    return (
      <main className="watch-page">
        <div className="watch-message restricted">
          <div className="message-icon">
            🔒
          </div>

          <h1>Content Restricted</h1>

          <p>
            This content is not available
            for {submission.child.name}.
          </p>

          <p className="reason">
            {access.reason}
          </p>

          <div className="safety-info">
            <p>
              <strong>
                Safety Status:
              </strong>{" "}
              Restricted
            </p>

            {submission.analysis && (
              <>
                <p>
                  <strong>
                    Risk Level:
                  </strong>{" "}
                  {
                    submission.analysis
                      .riskLevel
                  }
                </p>

                <p>
                  <strong>
                    Detected:
                  </strong>{" "}
                  {submission.analysis
                    .detectedCategories
                    .join(", ")}
                </p>
              </>
            )}
          </div>

          <a
            href={`/child/${childId}`}
            className="back-button"
          >
            ← Back to SafeScroll
          </a>
        </div>
      </main>
    );
  }

  // ---------------------------------------
  // 7. REVIEW
  // ---------------------------------------

  if (access.decision === "REVIEW") {
    return (
      <main className="watch-page">
        <div className="watch-message review">
          <div className="message-icon">
            ⚠️
          </div>

          <h1>Content Under Review</h1>

          <p>
            This content is currently waiting
            for parent review.
          </p>

          <p className="reason">
            {access.reason}
          </p>

          <div className="safety-info">
            <p>
              <strong>
                Child:
              </strong>{" "}
              {submission.child.name}
            </p>

            {submission.analysis && (
              <>
                <p>
                  <strong>
                    Risk Level:
                  </strong>{" "}
                  {
                    submission.analysis
                      .riskLevel
                  }
                </p>

                <p>
                  <strong>
                    AI Recommendation:
                  </strong>{" "}
                  {
                    submission.analysis
                      .recommendation
                  }
                </p>
              </>
            )}
          </div>

          <a
            href={`/child/${childId}`}
            className="back-button"
          >
            ← Back to SafeScroll
          </a>
        </div>
      </main>
    );
  }

  // ---------------------------------------
  // 8. ALLOW
  //
  // ONLY HERE do we use submission.url.
  // ---------------------------------------


  const embedUrl = getYouTubeEmbedUrl(submission.url);

  return (
    <main className="watch-page">
      <header className="watch-header">
        <div>
          <p className="child-name">
            {submission.child.name}'s SafeScroll
          </p>

          <h1>
            {submission.title}
          </h1>
        </div>

        <span className="allowed-badge">
          ✓ Allowed
        </span>
      </header>

      <section className="viewer-container">
        {/* <iframe
          src={submission.url}
          title={submission.title}
          className="content-viewer"
          allowFullScreen
        />
         */}
         {embedUrl ? (
  <iframe
    src={embedUrl ?? undefined}
    title={submission.title ?? undefined}
    className="content-viewer"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
) : (
  <div className="watch-error">
    <p>This content cannot be embedded.</p>

    <a
      href={submission.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Open original content
    </a>
  </div>
)}
      </section>

      <section className="content-safety-info">
        <h2>
          Safety Information
        </h2>

        {submission.analysis && (
          <div className="analysis-summary">
            <p>
              <strong>
                Risk Level:
              </strong>{" "}
              {
                submission.analysis
                  .riskLevel
              }
            </p>

            <p>
              <strong>
                Score:
              </strong>{" "}
              {
                submission.analysis.score
              }
              /100
            </p>

            <p>
              <strong>
                Categories:
              </strong>{" "}
              {submission.analysis
                .detectedCategories
                .join(", ")}
            </p>
          </div>
        )}
      </section>

      <a
        href={`/child/${childId}`}
        className="back-button"
      >
        ← Back to SafeScroll
      </a>
    </main>
  );
}