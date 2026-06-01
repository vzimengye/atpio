import { renderAnswersForAnalysis } from "./privacy";
import type { InsightRun, ProjectResponse } from "./types";

type ThemeRule = {
  name: string;
  keywords: string[];
  recommendation: string;
};

const themeRules: ThemeRule[] = [
  {
    name: "Unclear setup or onboarding instructions",
    keywords: ["onboarding", "setup", "confusing", "unclear", "next step"],
    recommendation:
      "Add clearer step labels, progress indicators, and recovery copy in onboarding.",
  },
  {
    name: "Permission or trust concerns",
    keywords: ["permission", "access", "privacy", "trust", "authorize"],
    recommendation:
      "Explain why permissions are requested before asking users to authorize access.",
  },
  {
    name: "Users want value earlier",
    keywords: ["tour", "long", "skip", "example", "working first", "value"],
    recommendation:
      "Move a working example earlier and make explanatory tours skippable.",
  },
  {
    name: "Error recovery is hard",
    keywords: ["error", "retry", "failed", "verification", "recover"],
    recommendation:
      "Add actionable error messages and retry paths for setup failures.",
  },
];

function detectTheme(text: string) {
  const lowerText = text.toLowerCase();
  return (
    themeRules.find((rule) =>
      rule.keywords.some((keyword) => lowerText.includes(keyword)),
    ) ?? {
      name: "General product feedback",
      keywords: [],
      recommendation:
        "Review uncategorized feedback manually and decide whether a new theme is needed.",
    }
  );
}

export function analyzeResponsesLocally(
  projectId: string,
  responses: ProjectResponse[],
): InsightRun {
  const grouped = new Map<string, { count: number; samples: string[]; rule: ThemeRule }>();

  for (const response of responses) {
    const text = renderAnswersForAnalysis(response.answers);
    const rule = detectTheme(text);
    const current = grouped.get(rule.name) ?? { count: 0, samples: [], rule };
    current.count += 1;
    if (current.samples.length < 2) {
      current.samples.push(text.split("\n")[0] ?? "Feedback response");
    }
    grouped.set(rule.name, current);
  }

  const themes = [...grouped.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, value]) => ({
      name,
      count: value.count,
      summary:
        value.samples.length > 0
          ? `Representative anonymized signal: ${value.samples.join(" / ")}`
          : "No representative sample available.",
    }));

  const recommendations = [...grouped.values()].map(
    (value) => value.rule.recommendation,
  );

  return {
    id: `insight_${Date.now()}`,
    projectId,
    status: "completed",
    engine: "atpio-local",
    inputCount: responses.length,
    themes,
    summary:
      responses.length === 0
        ? "No responses have been collected yet."
        : `Atpio analyzed ${responses.length} response${
            responses.length === 1 ? "" : "s"
          } with local privacy-preserving aggregation.`,
    recommendations: [...new Set(recommendations)],
    createdAt: new Date().toISOString(),
  };
}

