import {
  Recommendation,
  RiskLevel,
  SafetyCategory,
} from "@/app/generated/prisma/enums";

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

type DecisionInput = {
  riskLevel: RiskLevel;
  score: number;
  detectedCategories: SafetyCategory[];
  policy: SafetyPolicy;
};

type DecisionResult = {
  recommendation: Recommendation;
  reason: string;
};

export function decideSafety(
  input: DecisionInput
): DecisionResult {
  const {
    riskLevel,
    score,
    detectedCategories,
    policy,
  } = input;

  /*
   * Map AI safety categories
   * to the corresponding child policy.
   */
  const policyMap: Record<SafetyCategory, boolean> = {
    VIOLENCE: policy.violence,
    PROFANITY: policy.profanity,
    ADULT_CONTENT: policy.adultContent,
    DANGEROUS_BEHAVIOR: policy.dangerousBehavior,
    DRUGS: policy.drugs,
    HATE_CONTENT: policy.hateContent,
    DISTURBING_CONTENT: policy.disturbingContent,
    SELF_HARM: policy.selfHarm,
    NONE: false,
  };

  /*
   * Find categories detected by AI
   * that are blocked by the child's policy.
   */
  const blockedCategories = detectedCategories.filter(
    (category) => policyMap[category] === true
  );

  /*
   * RULE 1:
   * If AI detected something that the child's
   * policy blocks → RESTRICT.
   */
  if (blockedCategories.length > 0) {
    return {
      recommendation: Recommendation.RESTRICT,
      reason: `Blocked category detected: ${blockedCategories.join(", ")}`,
    };
  }

  /*
   * RULE 2:
   * High-risk content gets restricted
   * even if no specific policy category matched.
   */
  if (riskLevel === RiskLevel.HIGH || score >= 80) {
    return {
      recommendation: Recommendation.RESTRICT,
      reason: "High-risk content detected by AI.",
    };
  }

  /*
   * RULE 3:
   * Medium-risk content needs parent's review.
   */
  if (riskLevel === RiskLevel.MEDIUM || score >= 50) {
    return {
      recommendation: Recommendation.REVIEW,
      reason: "Medium-risk content requires parent review.",
    };
  }

  /*
   * RULE 4:
   * Safe / low-risk content can be allowed.
   */
  return {
    recommendation: Recommendation.ALLOW,
    reason: "Content is considered safe based on AI analysis and child policy.",
  };
}