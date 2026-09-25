import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const safetyResultSchema = z.object({
  riskLevel: z.enum(["SAFE", "LOW", "MEDIUM", "HIGH"]),

  score: z.number().min(0).max(100),

  explanation: z.string(),

  detectedCategories: z.array(
    z.enum([
      "VIOLENCE",
      "PROFANITY",
      "ADULT_CONTENT",
      "DANGEROUS_BEHAVIOR",
      "DRUGS",
      "HATE_CONTENT",
      "DISTURBING_CONTENT",
      "SELF_HARM",
      "NONE",
    ])
  ),
});

export type SafetyResult = z.infer<typeof safetyResultSchema>;

type AnalyzeInput = {
  title: string;
  description?: string | null;
  transcript?: string | null;
  imageUrl?: string | null;
};

export async function analyzeContent(
  input: AnalyzeInput
): Promise<SafetyResult> {
  const content = `
Title:
${input.title}

Description:
${input.description || "Not provided"}

Transcript:
${input.transcript || "Not provided"}

Image URL:
${input.imageUrl || "Not provided"}
`;

  const prompt = `
You are a child-safety content moderation AI for an application
called SafeScroll.

Your job is to analyze submitted content and determine whether
it may be unsafe for children.

Analyze the content carefully for:

1. Violence
2. Profanity
3. Adult content
4. Dangerous behavior
5. Drugs
6. Hate content
7. Disturbing content
8. Self-harm

Return ONLY valid JSON.

The JSON must have exactly these fields:

{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH",
  "score": number,
  "explanation": "short explanation",
  "detectedCategories": [
    "VIOLENCE",
    "PROFANITY",
    "ADULT_CONTENT",
    "DANGEROUS_BEHAVIOR",
    "DRUGS",
    "HATE_CONTENT",
    "DISTURBING_CONTENT",
    "SELF_HARM",
    "NONE"
  ]
}

Rules:

- score must be between 0 and 100.
- 0 means completely safe.
- 100 means extremely unsafe.
- Use NONE when no safety category is detected.
- Do not invent categories.
- Keep the explanation concise.
- Return JSON only.
- Do not wrap the JSON in markdown code fences.

Content to analyze:

${content}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  const output = response.text;

  if (!output) {
    throw new Error("Gemini returned an empty response");
  }

  let parsed;

  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  return safetyResultSchema.parse(parsed);
}