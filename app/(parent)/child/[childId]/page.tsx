"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import "./child.css";

type Analysis = {
  riskLevel: string;
  score: number;
  explanation: string;
  recommendation: string;
  detectedCategories: string[];
};

type Submission = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  status: string;
  parentDecision: string | null;
  createdAt: string;
  analysis: Analysis | null;
};

type Child = {
  id: number;
  name: string;
  age: number;
};

export default function ChildPage() {
  const params = useParams();

  const childId = Number(params.childId);

  const [child, setChild] = useState<Child | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!childId || Number.isNaN(childId)) {
      setError("Invalid child ID.");
      setLoading(false);
      return;
    }

    const loadChildContent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/children/${childId}/content`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load content.");
        }

        setChild(data.child);
        setSubmissions(data.submissions || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChildContent();
  }, [childId]);

  const getStatus = (submission: Submission) => {
    if (submission.status !== "ANALYZED") {
      return {
        label: "Under Analysis",
        className: "status-pending",
      };
    }

    if (submission.parentDecision === "RESTRICTED") {
      return {
        label: "Restricted",
        className: "status-restricted",
      };
    }

    if (submission.parentDecision === "REVIEW") {
      return {
        label: "Under Review",
        className: "status-review",
      };
    }

    if (submission.parentDecision === "ALLOWED") {
      return {
        label: "Allowed",
        className: "status-allowed",
      };
    }

    if (submission.analysis?.recommendation === "RESTRICT") {
      return {
        label: "Restricted",
        className: "status-restricted",
      };
    }

    if (submission.analysis?.recommendation === "REVIEW") {
      return {
        label: "Under Review",
        className: "status-review",
      };
    }

    if (submission.analysis?.recommendation === "ALLOW") {
      return {
        label: "Allowed",
        className: "status-allowed",
      };
    }

    return {
      label: "Under Review",
      className: "status-review",
    };
  };

  if (loading) {
    return (
      <main className="child-page">
        <div className="child-loading">
          <div className="loading-spinner"></div>
          <p>Loading SafeScroll...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="child-page">
        <div className="child-error">
          <h1>Something went wrong</h1>
          <p>{error}</p>

          <Link href="/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!child) {
    return (
      <main className="child-page">
        <div className="child-error">
          <h1>Child not found</h1>

          <Link href="/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="child-page">

      {/* Header */}
      <header className="child-header">

        <div>
          <p className="safe-label">
            🛡️ SafeScroll
          </p>

          <h1>
            Hi {child.name}! 👋
          </h1>

          <p className="child-subtitle">
            Here is your safe content.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="parent-button"
        >
          ← Parent Dashboard
        </Link>

      </header>


      {/* Safety Banner */}
      <section className="safety-banner">

        <div className="safety-icon">
          🛡️
        </div>

        <div>
          <h2>You are in SafeScroll</h2>

          <p>
            Content is checked for safety before you can watch it.
          </p>
        </div>

      </section>


      {/* Content */}
      <section className="content-section">

        <div className="section-header">
          <div>
            <h2>Your Content</h2>

            <p>
              Only content approved for you can be watched.
            </p>
          </div>

          <span className="content-count">
            {submissions.length} content
          </span>
        </div>


        {submissions.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📺
            </div>

            <h2>No content yet</h2>

            <p>
              Your parent hasn't submitted any content for you yet.
            </p>

          </div>
        ) : (
          <div className="content-grid">

            {submissions.map((submission) => {

              const status = getStatus(submission);

              return (
                <article
                  key={submission.id}
                  className="content-card"
                >

                  {/* Thumbnail placeholder */}
                  <div className="content-thumbnail">
                    <span>▶</span>
                  </div>


                  <div className="content-card-body">

                    <div className="content-title-row">

                      <h3>
                        {submission.title}
                      </h3>

                      <span
                        className={`status-badge ${status.className}`}
                      >
                        {status.label}
                      </span>

                    </div>


                    {submission.description && (
                      <p className="content-description">
                        {submission.description}
                      </p>
                    )}


                    {submission.analysis && (
                      <div className="safety-details">

                        <span>
                          Risk:{" "}
                          <strong>
                            {submission.analysis.riskLevel}
                          </strong>
                        </span>

                        <span>
                          Score:{" "}
                          <strong>
                            {submission.analysis.score}/100
                          </strong>
                        </span>

                      </div>
                    )}


                    {/* Watch button */}
                    <Link
                      href={`/child/${childId}/watch/${submission.id}`}
                      className="watch-button"
                    >
                      ▶ Watch
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

    </main>
  );
}