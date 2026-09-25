"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./submit.css";

type Child = {
  id: number;
  name: string;
  age: number;
};

type AnalysisResult = {
  riskLevel: "SAFE" | "LOW" | "MEDIUM" | "HIGH";
  score: number;
  explanation: string;
  recommendation: "ALLOW" | "RESTRICT" | "REVIEW";
  detectedCategories: string[];
};

type SubmissionResult = {
  id: number;
  title: string;
  status: string;
  analysis?: AnalysisResult | null;
};

export default function SubmitContentPage() {
  const router = useRouter();

  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  const [formData, setFormData] = useState({
    childId: "",
    url: "",
    title: "",
    description: "",
    transcript: "",
    imageUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState("");

  // ------------------------------------
  // Load children
  // ------------------------------------

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        setError("");

        const response = await fetch("/api/children");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load children");
        }

        setChildren(data.children || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load children"
        );
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, []);

  // ------------------------------------
  // Input change
  // ------------------------------------

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------
  // Submit content
  // ------------------------------------

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!formData.childId) {
      setError("Please select a child.");
      return;
    }

    if (!formData.url.trim()) {
      setError("Please enter a content URL.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a content title.");
      return;
    }

    try {
      setSubmitting(true);

      // -----------------------------
      // STEP 1: Create submission
      // -----------------------------

      const submissionResponse = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childId: Number(formData.childId),
          url: formData.url.trim(),
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          transcript: formData.transcript.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
        }),
      });

      const submissionData = await submissionResponse.json();

      if (!submissionResponse.ok) {
        throw new Error(
          submissionData.error || "Failed to create submission"
        );
      }

      const submissionId = submissionData.submission.id;

      // Show pending result immediately
      setResult({
        id: submissionId,
        title: submissionData.submission.title,
        status: submissionData.submission.status,
      });

      // -----------------------------
      // STEP 2: Analyze submission
      // -----------------------------

      setAnalyzing(true);

      const analysisResponse = await fetch(
        `/api/submissions/${submissionId}/analyze`,
        {
          method: "POST",
        }
      );

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(
          analysisData.error || "Failed to analyze content"
        );
      }

      // -----------------------------
      // STEP 3: Show AI result
      // -----------------------------

      // -----------------------------
// STEP 3: Show AI result
// -----------------------------

const aiResult = analysisData.result?.ai;
const policyDecision = analysisData.result?.policyDecision;

setResult({
  id: submissionId,
  title: formData.title,
  status: "ANALYZED",

  analysis: aiResult
    ? {
        riskLevel: aiResult.riskLevel,
        score: aiResult.score,
        explanation: aiResult.explanation,
        recommendation:
          policyDecision?.recommendation || "REVIEW",
        detectedCategories:
          aiResult.detectedCategories || [],
      }
    : null,
});

      // Clear form after successful analysis
      setFormData({
        childId: "",
        url: "",
        title: "",
        description: "",
        transcript: "",
        imageUrl: "",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
      setAnalyzing(false);
    }
  };

  // ------------------------------------
  // New submission
  // ------------------------------------

  const handleNewSubmission = () => {
    setResult(null);
    setError("");

    setFormData({
      childId: "",
      url: "",
      title: "",
      description: "",
      transcript: "",
      imageUrl: "",
    });
  };

  // ------------------------------------
  // Recommendation helper
  // ------------------------------------

  const getRecommendationClass = (
    recommendation?: string
  ) => {
    if (recommendation === "ALLOW") return "recommendation allow";
    if (recommendation === "RESTRICT")
      return "recommendation restrict";

    return "recommendation review";
  };

  return (
    <main className="submit-page">
      <div className="submit-container">

        {/* Header */}
        <header className="submit-header">
          <div>
            <p className="page-label">SafeScroll</p>

            <h1>Submit Content</h1>

            <p>
              Submit content for AI-powered child safety analysis.
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => router.push("/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="submit-grid">

          {/* -------------------------------- */}
          {/* FORM */}
          {/* -------------------------------- */}

          <section className="form-card">

            <h2>Content Details</h2>

            <p className="section-description">
              Choose a child and provide the content information
              that SafeScroll should analyze.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Child */}
              <div className="form-group">
                <label htmlFor="childId">
                  Select Child
                </label>

                <select
                  id="childId"
                  name="childId"
                  value={formData.childId}
                  onChange={handleChange}
                  disabled={loadingChildren || submitting}
                >
                  <option value="">
                    {loadingChildren
                      ? "Loading children..."
                      : "Select a child"}
                  </option>

                  {children.map((child) => (
                    <option
                      key={child.id}
                      value={child.id}
                    >
                      {child.name} — {child.age} years
                    </option>
                  ))}
                </select>

                {children.length === 0 &&
                  !loadingChildren && (
                    <small className="field-help">
                      No children found. Create a child profile
                      first.
                    </small>
                  )}
              </div>

              {/* URL */}
              <div className="form-group">
                <label htmlFor="url">
                  Content URL *
                </label>

                <input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://example.com/video"
                  value={formData.url}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />

                <small className="field-help">
                  Enter the URL of the content you want to
                  analyze.
                </small>
              </div>

              {/* Title */}
              <div className="form-group">
                <label htmlFor="title">
                  Content Title *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Funny Family Video"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe what happens in this content..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              {/* Transcript */}
              <div className="form-group">
                <label htmlFor="transcript">
                  Transcript
                </label>

                <textarea
                  id="transcript"
                  name="transcript"
                  rows={5}
                  placeholder="Paste the video's transcript or spoken content..."
                  value={formData.transcript}
                  onChange={handleChange}
                  disabled={submitting}
                />

                <small className="field-help">
                  AI uses this information to identify potentially
                  unsafe language or topics.
                </small>
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label htmlFor="imageUrl">
                  Image URL
                </label>

                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="analyze-button"
                disabled={
                  submitting ||
                  analyzing ||
                  loadingChildren ||
                  children.length === 0
                }
              >
                {submitting
                  ? "Submitting..."
                  : "🛡️ Analyze Content"}
              </button>
            </form>
          </section>

          {/* -------------------------------- */}
          {/* RESULT */}
          {/* -------------------------------- */}

          <section className="result-card">

            <h2>Safety Analysis</h2>

            {!result && (
              <div className="empty-result">
                <div className="empty-icon">🛡️</div>

                <h3>No analysis yet</h3>

                <p>
                  Submit content and SafeScroll will analyze it
                  using AI and the selected child's safety policy.
                </p>
              </div>
            )}

            {result && !result.analysis && (
              <div className="analyzing-state">
                <div className="loader"></div>

                <h3>
                  {analyzing
                    ? "Analyzing Content..."
                    : "Content Submitted"}
                </h3>

                <p>
                  {analyzing
                    ? "AI is checking the content against the child's safety policy."
                    : "Your content has been submitted."}
                </p>

                <span className="status-badge">
                  {result.status}
                </span>
              </div>
            )}

            {result?.analysis && (
              <div className="analysis-result">

                {/* Risk */}
                <div className="result-top">

                  <div>
                    <span className="result-label">
                      Risk Level
                    </span>

                    <strong
                      className={`risk-${result.analysis.riskLevel.toLowerCase()}`}
                    >
                      {result.analysis.riskLevel}
                    </strong>
                  </div>

                  <div className="score-box">
                    <span>Safety Score</span>

                    <strong>
                      {result.analysis.score}/100
                    </strong>
                  </div>

                </div>

                {/* Recommendation */}
                <div
                  className={getRecommendationClass(
                    result.analysis.recommendation
                  )}
                >
                  <span>
                    AI Recommendation
                  </span>

                  <strong>
                    {result.analysis.recommendation}
                  </strong>
                </div>

                {/* Categories */}
                <div className="result-section">

                  <h3>
                    Detected Categories
                  </h3>

                  {result.analysis.detectedCategories
                    .length > 0 ? (
                    <div className="category-list">
                      {result.analysis.detectedCategories.map(
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
                  ) : (
                    <p className="safe-text">
                      ✓ No harmful categories detected.
                    </p>
                  )}
                </div>

                {/* Explanation */}
                <div className="result-section">

                  <h3>AI Explanation</h3>

                  <p className="explanation">
                    {result.analysis.explanation}
                  </p>

                </div>

                {/* Next action */}
                <div className="next-action">

                  {result.analysis.recommendation ===
                    "ALLOW" && (
                    <>
                      <strong>
                        ✓ Content appears safe
                      </strong>

                      <p>
                        The parent can allow this content
                        from the dashboard.
                      </p>
                    </>
                  )}

                  {result.analysis.recommendation ===
                    "RESTRICT" && (
                    <>
                      <strong>
                        🔒 Content should be restricted
                      </strong>

                      <p>
                        The detected content conflicts with
                        the child's safety requirements.
                      </p>
                    </>
                  )}

                  {result.analysis.recommendation ===
                    "REVIEW" && (
                    <>
                      <strong>
                        ⚠️ Parent review required
                      </strong>

                      <p>
                        The parent should review this content
                        before allowing access.
                      </p>
                    </>
                  )}

                </div>

                <button
                  type="button"
                  className="new-submission-button"
                  onClick={handleNewSubmission}
                >
                  + Submit Another Content
                </button>

              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  );
}