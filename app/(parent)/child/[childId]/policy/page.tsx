"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import "./policy.css";

type Policy = {
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
};

const defaultPolicy: Policy = {
  violence: true,
  profanity: true,
  adultContent: true,
  dangerousBehavior: true,
  drugs: true,
  hateContent: true,
  disturbingContent: true,
  selfHarm: true,
};

export default function SafetyPolicyPage() {
  const params = useParams();
  const router = useRouter();

  const childId = Number(params.childId);

  const [child, setChild] = useState<Child | null>(null);
  const [policy, setPolicy] = useState<Policy>(defaultPolicy);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!childId || Number.isNaN(childId)) {
      setError("Invalid child ID.");
      setLoading(false);
      return;
    }

    const loadPolicy = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * /api/children already returns:
         *
         * child + safetyPolicy
         *
         * So we use that existing API rather than
         * creating another GET policy endpoint.
         */
        const response = await fetch("/api/children");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load child information."
          );
        }

        const selectedChild = data.children?.find(
          (item: Child) => item.id === childId
        );

        if (!selectedChild) {
          throw new Error("Child not found.");
        }

        setChild(selectedChild);

        if (selectedChild.safetyPolicy) {
          setPolicy({
            violence: selectedChild.safetyPolicy.violence,
            profanity: selectedChild.safetyPolicy.profanity,
            adultContent: selectedChild.safetyPolicy.adultContent,
            dangerousBehavior:
              selectedChild.safetyPolicy.dangerousBehavior,
            drugs: selectedChild.safetyPolicy.drugs,
            hateContent: selectedChild.safetyPolicy.hateContent,
            disturbingContent:
              selectedChild.safetyPolicy.disturbingContent,
            selfHarm: selectedChild.safetyPolicy.selfHarm,
          });
        }
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

    loadPolicy();
  }, [childId]);

  const handleToggle = (field: keyof Policy) => {
    setPolicy((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));

    setMessage("");
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `/api/children/${childId}/policy`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(policy),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save safety policy."
        );
      }

      setMessage("Safety policy saved successfully.");

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="policy-page">
        <div className="policy-loading">
          <div className="policy-spinner"></div>
          <p>Loading safety policy...</p>
        </div>
      </main>
    );
  }

  if (error && !child) {
    return (
      <main className="policy-page">
        <div className="policy-error">
          <h1>Unable to load policy</h1>

          <p>{error}</p>

          <button
            onClick={() => router.push("/dashboard")}
            className="policy-button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!child) {
    return null;
  }

  const policyOptions: {
    key: keyof Policy;
    title: string;
    description: string;
  }[] = [
    {
      key: "violence",
      title: "Violence",
      description:
        "Block content containing fighting, physical violence or violent acts.",
    },
    {
      key: "profanity",
      title: "Profanity",
      description:
        "Block content containing abusive, offensive or inappropriate language.",
    },
    {
      key: "adultContent",
      title: "Adult Content",
      description:
        "Block sexually explicit or age-inappropriate adult content.",
    },
    {
      key: "dangerousBehavior",
      title: "Dangerous Behavior",
      description:
        "Block dangerous challenges, stunts or activities that could cause harm.",
    },
    {
      key: "drugs",
      title: "Drugs",
      description:
        "Block content involving drugs or substance abuse.",
    },
    {
      key: "hateContent",
      title: "Hate Content",
      description:
        "Block content containing hateful or discriminatory material.",
    },
    {
      key: "disturbingContent",
      title: "Disturbing Content",
      description:
        "Block disturbing, frightening or highly upsetting content.",
    },
    {
      key: "selfHarm",
      title: "Self Harm",
      description:
        "Block content involving self-harm or related harmful behavior.",
    },
  ];

  return (
    <main className="policy-page">

      {/* Header */}

      <header className="policy-header">

        <div>
          <p className="policy-label">
            🛡️ SafeScroll
          </p>

          <h1>
            {child.name}'s Safety Policy
          </h1>

          <p>
            Age: {child.age}
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="back-dashboard-button"
        >
          ← Dashboard
        </button>

      </header>


      {/* Explanation */}

      <section className="policy-intro">

        <div className="policy-intro-icon">
          🛡️
        </div>

        <div>
          <h2>Choose what SafeScroll should block</h2>

          <p>
            Turn on a category to restrict content containing
            that type of material for {child.name}.
          </p>
        </div>

      </section>


      {/* Messages */}

      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* Policy List */}

      <section className="policy-card">

        <div className="policy-card-header">
          <h2>Content Safety Controls</h2>

          <p>
            These settings are applied during AI safety analysis.
          </p>
        </div>


        <div className="policy-list">

          {policyOptions.map((option) => (

            <div
              key={option.key}
              className="policy-row"
            >

              <div className="policy-info">

                <h3>
                  {option.title}
                </h3>

                <p>
                  {option.description}
                </p>

              </div>


              <button
                type="button"
                role="switch"
                aria-checked={policy[option.key]}
                className={`toggle ${
                  policy[option.key]
                    ? "toggle-on"
                    : "toggle-off"
                }`}
                onClick={() =>
                  handleToggle(option.key)
                }
              >

                <span className="toggle-circle"></span>

              </button>

            </div>

          ))}

        </div>


        {/* Save */}

        <div className="policy-actions">

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="cancel-button"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="save-button"
          >
            {saving ? "Saving..." : "Save Policy"}
          </button>

        </div>

      </section>

    </main>
  );
}