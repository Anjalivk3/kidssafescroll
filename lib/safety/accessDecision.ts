import {
  ParentDecision,
  Recommendation,
  SubmissionStatus,
} from "@/app/generated/prisma/enums";

type AccessInput = {
  status: SubmissionStatus;
  aiRecommendation: Recommendation | null;
  parentDecision: ParentDecision | null;
};

export type AccessDecision =
  | "ALLOW"
  | "RESTRICT"
  | "REVIEW";

type AccessResult = {
  decision: AccessDecision;
  reason: string;
};

export function decideContentAccess(
  input: AccessInput
): AccessResult {
  const {
    status,
    aiRecommendation,
    parentDecision,
  } = input;

  /*
   * Rule 1:
   * Content that has not been analyzed
   * should not automatically be shown.
   */
  if (status !== SubmissionStatus.ANALYZED) {
    return {
      decision: "REVIEW",
      reason:
        "Content has not completed safety analysis.",
    };
  }

  /*
   * Rule 2:
   * Explicit parent decision has priority.
   */
  if (parentDecision === ParentDecision.ALLOWED) {
    return {
      decision: "ALLOW",
      reason:
        "Parent explicitly allowed this content.",
    };
  }

  if (
    parentDecision ===
    ParentDecision.RESTRICTED
  ) {
    return {
      decision: "RESTRICT",
      reason:
        "Parent explicitly restricted this content.",
    };
  }

  if (parentDecision === ParentDecision.REVIEW) {
    return {
      decision: "REVIEW",
      reason:
        "Parent requested review for this content.",
    };
  }

  /*
   * Rule 3:
   * If parent hasn't made a decision,
   * use AI recommendation.
   */
  if (
    aiRecommendation === Recommendation.ALLOW
  ) {
    return {
      decision: "ALLOW",
      reason:
        "AI safety analysis marked this content as safe.",
    };
  }

  if (
    aiRecommendation === Recommendation.RESTRICT
  ) {
    return {
      decision: "RESTRICT",
      reason:
        "AI safety analysis recommends restricting this content.",
    };
  }

  /*
   * REVIEW or missing recommendation
   */
  return {
    decision: "REVIEW",
    reason:
      "Content requires parent review.",
  };
}