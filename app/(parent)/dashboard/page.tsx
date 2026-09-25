"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import "./dashboard.css";

type SafetyPolicy = {
  violence: boolean;
  profanity: boolean;
  adultContent: boolean;
  dangerousBehavior: boolean;
  drugs: boolean;
  hateContent: boolean;
  disturbingContent: boolean;
  selfHarm: boolean;
};

type Child = {
  id: number;
  name: string;
  age: number;
  safetyPolicy?: SafetyPolicy | null;
};

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
  status: string;
  parentDecision: string | null;
  child: Child;
  analysis: Analysis | null;
};

type DashboardData = {
  stats: {
    children: number;
    totalContent: number;
    safe: number;
    restricted: number;
    review: number;
    pending: number;
    errors: number;
  };
  recentSubmissions: Submission[];
};

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [children, setChildren] = useState<Child[]>([]);

  const [loading, setLoading] = useState(true);

  const [childrenLoading, setChildrenLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [decisionLoading, setDecisionLoading] =
    useState<number | null>(null);

  const [showAddChild, setShowAddChild] =
    useState(false);

  const [childForm, setChildForm] = useState({
    name: "",
    age: "",
  });

  const [addingChild, setAddingChild] =
    useState(false);

  // ==========================================
  // Fetch dashboard
  // ==========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load dashboard"
        );
      }

      setDashboard(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Fetch children
  // ==========================================

  const fetchChildren = async () => {
    try {
      setChildrenLoading(true);

      const response = await fetch("/api/children");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load children"
        );
      }

      setChildren(data.children || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load children"
      );
    } finally {
      setChildrenLoading(false);
    }
  };

  // ==========================================
  // Initial loading
  // ==========================================

  useEffect(() => {
    fetchDashboard();
    fetchChildren();
  }, []);

  // ==========================================
  // Add child
  // ==========================================

  const handleAddChild = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");

    const name = childForm.name.trim();
    const age = Number(childForm.age);

    if (!name) {
      setError("Please enter the child's name.");
      return;
    }

    if (
      !Number.isInteger(age) ||
      age < 0 ||
      age > 18
    ) {
      setError(
        "Child age must be a whole number between 0 and 18."
      );
      return;
    }

    try {
      setAddingChild(true);

      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          age,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to add child."
        );
      }

      // Add the newly-created child to the UI
      setChildren((previousChildren) => [
        data.child,
        ...previousChildren,
      ]);

      // Reset form
      setChildForm({
        name: "",
        age: "",
      });

      // Hide form
      setShowAddChild(false);

      // Refresh dashboard statistics
      await fetchDashboard();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add child."
      );
    } finally {
      setAddingChild(false);
    }
  };

  // ==========================================
  // Delete child
  // ==========================================

  const handleDeleteChild = async (
    childId: number,
    childName: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${childName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/children/${childId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete child."
        );
      }

      setChildren((previousChildren) =>
        previousChildren.filter(
          (child) => child.id !== childId
        )
      );

      await fetchDashboard();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete child."
      );
    }
  };

  // ==========================================
  // Parent decision
  // ==========================================

  const handleDecision = async (
    submissionId: number,
    decision:
      | "ALLOWED"
      | "RESTRICTED"
      | "REVIEW"
  ) => {
    try {
      setDecisionLoading(submissionId);
      setError("");

      const response = await fetch(
        `/api/submissions/${submissionId}/decision`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update decision"
        );
      }

      await fetchDashboard();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update decision"
      );
    } finally {
      setDecisionLoading(null);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading && !dashboard) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loader"></div>
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error && !dashboard) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button onClick={fetchDashboard}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return null;
  }

  // ==========================================
  // Review queue
  // ==========================================

  const reviewQueue =
    dashboard.recentSubmissions.filter(
      (submission) =>
        submission.status === "ANALYZED" &&
        submission.analysis &&
        (
          submission.parentDecision === null ||
          submission.parentDecision === "REVIEW" ||
          submission.analysis.recommendation ===
            "REVIEW"
        )
    );

  // ==========================================
  // Render
  // ==========================================

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <header className="dashboard-header">
          <div>
            <p className="dashboard-label">
              SafeScroll
            </p>

            <h1>Parent Dashboard</h1>

            <p>
              Monitor your children&apos;s content
              safety and review AI recommendations.
            </p>
          </div>

          <Link
            href="/submit"
            className="submit-content-button"
          >
            + Submit Content
          </Link>
        </header>

        {/* ================================= */}
        {/* INLINE ERROR */}
        {/* ================================= */}

        {error && (
          <div className="dashboard-inline-error">
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* CHILDREN SECTION */}
        {/* ================================= */}

        <section className="children-section">

          <div className="section-heading">
            <div>
              <h2>Your Children</h2>

              <p>
                Manage child profiles and their safety
                settings.
              </p>
            </div>

            <button
              className="add-child-button"
              onClick={() =>
                setShowAddChild(!showAddChild)
              }
            >
              {showAddChild
                ? "✕ Cancel"
                : "+ Add Child"}
            </button>
          </div>

          {/* ================================= */}
          {/* ADD CHILD FORM */}
          {/* ================================= */}

          {showAddChild && (
            <form
              className="add-child-form"
              onSubmit={handleAddChild}
            >
              <h3>Add Child Profile</h3>

              <div className="child-form-grid">

                <div className="form-group">
                  <label htmlFor="childName">
                    Child Name
                  </label>

                  <input
                    id="childName"
                    type="text"
                    placeholder="Enter child's name"
                    value={childForm.name}
                    onChange={(e) =>
                      setChildForm({
                        ...childForm,
                        name: e.target.value,
                      })
                    }
                    disabled={addingChild}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="childAge">
                    Age
                  </label>

                  <input
                    id="childAge"
                    type="number"
                    min="0"
                    max="18"
                    placeholder="Age"
                    value={childForm.age}
                    onChange={(e) =>
                      setChildForm({
                        ...childForm,
                        age: e.target.value,
                      })
                    }
                    disabled={addingChild}
                  />
                </div>

              </div>

              <button
                type="submit"
                className="save-child-button"
                disabled={addingChild}
              >
                {addingChild
                  ? "Adding Child..."
                  : "Add Child"}
              </button>
            </form>
          )}

          {/* ================================= */}
          {/* CHILDREN LIST */}
          {/* ================================= */}

          {childrenLoading ? (
            <div className="children-loading">
              Loading children...
            </div>
          ) : children.length === 0 ? (
            <div className="children-empty">
              <div className="children-empty-icon">
                👶
              </div>

              <h3>No child profiles yet</h3>

              <p>
                Add your first child profile to start
                configuring SafeScroll.
              </p>

              <button
                className="add-child-button"
                onClick={() =>
                  setShowAddChild(true)
                }
              >
                + Add Your First Child
              </button>
            </div>
          ) : (
            <div className="children-grid">

              {children.map((child) => (
                <article
                  key={child.id}
                  className="child-card"
                >
                  <div className="child-card-header">

                    <div className="child-avatar">
                      👶
                    </div>

                    <div>
                      <h3>{child.name}</h3>

                      <p>
                        Age {child.age}
                      </p>
                    </div>

                  </div>

                  <div className="child-policy-status">

                    <span
                      className={
                        child.safetyPolicy
                          ? "policy-active"
                          : "policy-missing"
                      }
                    >
                      {child.safetyPolicy
                        ? "✓ Safety policy configured"
                        : "⚠ Safety policy not configured"}
                    </span>

                  </div>

                  <div className="child-card-actions">

                    <Link
                      href={`/child/${child.id}/policy`}
                      className="policy-button"
                    >
                      ⚙ Safety Policy
                    </Link>

                    <Link
                      href={`/child/${child.id}`}
                      className="view-child-button"
                    >
                      🎬 View Content
                    </Link>

                  </div>

                  <button
                    className="delete-child-button"
                    onClick={() =>
                      handleDeleteChild(
                        child.id,
                        child.name
                      )
                    }
                  >
                    Delete Child
                  </button>
                </article>
              ))}

            </div>
          )}

        </section>

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-icon">
              👶
            </span>

            <div>
              <p>Children</p>

              <strong>
                {dashboard.stats.children}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              🎬
            </span>

            <div>
              <p>Total Content</p>

              <strong>
                {dashboard.stats.totalContent}
              </strong>
            </div>
          </div>

          <div className="stat-card safe-stat">
            <span className="stat-icon">
              ✓
            </span>

            <div>
              <p>Safe</p>

              <strong>
                {dashboard.stats.safe}
              </strong>
            </div>
          </div>

          <div className="stat-card restricted-stat">
            <span className="stat-icon">
              🔒
            </span>

            <div>
              <p>Restricted</p>

              <strong>
                {dashboard.stats.restricted}
              </strong>
            </div>
          </div>

          <div className="stat-card review-stat">
            <span className="stat-icon">
              ⚠️
            </span>

            <div>
              <p>Review</p>

              <strong>
                {dashboard.stats.review}
              </strong>
            </div>
          </div>

          <div className="stat-card pending-stat">
            <span className="stat-icon">
              ⏳
            </span>

            <div>
              <p>Pending</p>

              <strong>
                {dashboard.stats.pending}
              </strong>
            </div>
          </div>

        </section>

        {/* ================================= */}
        {/* PARENT REVIEW QUEUE */}
        {/* ================================= */}

        <section className="review-queue">

          <div className="section-heading">

            <div>
              <h2>Parent Review Queue</h2>

              <p>
                Review content that needs your
                decision before your child can
                access it.
              </p>
            </div>

            <span className="queue-count">
              {reviewQueue.length}
            </span>

          </div>

          {reviewQueue.length === 0 ? (
            <div className="empty-queue">

              <div className="empty-queue-icon">
                ✓
              </div>

              <h3>All caught up!</h3>

              <p>
                There is no content waiting for
                your review right now.
              </p>

            </div>
          ) : (
            <div className="review-list">

              {reviewQueue.map((submission) => {

                const analysis =
                  submission.analysis!;

                const isLoading =
                  decisionLoading ===
                  submission.id;

                return (
                  <article
                    key={submission.id}
                    className="review-card"
                  >

                    <div className="review-card-top">

                      <div className="review-title">

                        <h3>
                          {submission.title}
                        </h3>

                        <p>
                          👶{" "}
                          {submission.child.name}
                          {" · "}
                          Age{" "}
                          {submission.child.age}
                        </p>

                      </div>

                      <span
                        className={`risk-badge risk-${analysis.riskLevel.toLowerCase()}`}
                      >
                        {analysis.riskLevel}
                      </span>

                    </div>

                    <div className="ai-summary">

                      <div className="summary-item">
                        <span>
                          Safety Score
                        </span>

                        <strong>
                          {analysis.score}/100
                        </strong>
                      </div>

                      <div className="summary-item">
                        <span>
                          AI Recommendation
                        </span>

                        <strong>
                          {analysis.recommendation}
                        </strong>
                      </div>

                    </div>

                    {analysis.detectedCategories
                      .length > 0 && (
                      <div className="detected-section">

                        <span>
                          Detected:
                        </span>

                        <div className="category-list">

                          {analysis.detectedCategories.map(
                            (category) => (
                              <span
                                key={category}
                                className="category-tag"
                              >
                                {category}
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}

                    <div className="review-explanation">

                      <strong>
                        AI Explanation
                      </strong>

                      <p>
                        {analysis.explanation}
                      </p>

                    </div>

                    <div className="parent-decision">

                      <span>
                        Parent Decision
                      </span>

                      <div className="decision-buttons">

                        <button
                          className="allow-button"
                          disabled={isLoading}
                          onClick={() =>
                            handleDecision(
                              submission.id,
                              "ALLOWED"
                            )
                          }
                        >
                          {isLoading
                            ? "Saving..."
                            : "✓ Allow"}
                        </button>

                        <button
                          className="restrict-button"
                          disabled={isLoading}
                          onClick={() =>
                            handleDecision(
                              submission.id,
                              "RESTRICTED"
                            )
                          }
                        >
                          🔒 Restrict
                        </button>

                        <button
                          className="review-button"
                          disabled={isLoading}
                          onClick={() =>
                            handleDecision(
                              submission.id,
                              "REVIEW"
                            )
                          }
                        >
                          ⚠ Review
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* ================================= */}
        {/* RECENT CONTENT */}
        {/* ================================= */}

        <section className="recent-content">

          <div className="section-heading">

            <div>
              <h2>Recent Content</h2>

              <p>
                Latest content analyzed by
                SafeScroll.
              </p>
            </div>

          </div>

          {dashboard.recentSubmissions.length ===
          0 ? (
            <div className="empty-content">

              <p>
                No content has been submitted yet.
              </p>

              <Link href="/submit">
                Submit your first content
              </Link>

            </div>
          ) : (
            <div className="recent-list">

              {dashboard.recentSubmissions.map(
                (submission) => (
                  <div
                    key={submission.id}
                    className="recent-item"
                  >

                    <div>

                      <strong>
                        {submission.title}
                      </strong>

                      <p>
                        {submission.child.name}
                        {" · "}
                        {submission.status}
                      </p>

                    </div>

                    <div className="recent-status">

                      {submission.analysis ? (
                        <span
                          className={`recommendation-badge ${submission.analysis.recommendation.toLowerCase()}`}
                        >
                          {
                            submission.analysis
                              .recommendation
                          }
                        </span>
                      ) : (
                        <span className="pending-badge">
                          {submission.status}
                        </span>
                      )}

                      {submission.parentDecision && (
                        <span className="parent-badge">
                          Parent:{" "}
                          {submission.parentDecision}
                        </span>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}