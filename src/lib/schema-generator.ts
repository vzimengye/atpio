import type { ProjectSchema } from "./types";

function titleFromBrief(brief: string) {
  const normalized = brief.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "Feedback Form";
  }

  if (/onboarding/i.test(normalized)) {
    return "Onboarding Feedback";
  }

  if (/game|level|player/i.test(normalized)) {
    return "Player Feedback";
  }

  if (/dashboard|metric|report/i.test(normalized)) {
    return "Dashboard Feedback";
  }

  return "Product Feedback";
}

export function generateSchemaFromBrief(brief: string): ProjectSchema {
  const title = titleFromBrief(brief);
  const lowerBrief = brief.toLowerCase();

  const fields: ProjectSchema["fields"] = [
    {
      id: "main_feedback",
      type: "long_text",
      label: "What is the most important thing you want us to know?",
      required: true,
    },
  ];

  if (lowerBrief.includes("why") || lowerBrief.includes("为什么")) {
    fields.push({
      id: "reason",
      type: "long_text",
      label: "What was the main reason behind this?",
      required: true,
    });
  }

  if (lowerBrief.includes("step") || lowerBrief.includes("onboarding")) {
    fields.push({
      id: "stuck_step",
      type: "single_select",
      label: "Where did you get stuck?",
      options: ["Account setup", "Permissions", "Product tour", "Other"],
    });
  }

  if (
    lowerBrief.includes("difficulty") ||
    lowerBrief.includes("难度") ||
    lowerBrief.includes("confidence")
  ) {
    fields.push({
      id: "rating",
      type: "rating",
      label: "How would you rate this experience?",
    });
  }

  fields.push({
    id: "follow_up",
    type: "boolean",
    label: "May we follow up if we need more detail?",
  });

  return {
    title,
    description:
      "A lightweight Atpio form generated from the project brief. Responses will be analyzed in aggregate.",
    fields,
  };
}

export function projectNameFromBrief(brief: string) {
  return titleFromBrief(brief).replace("Feedback", "Feedback Project");
}

export function projectIdFromName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return `project_${slug || "feedback"}_${Date.now().toString(36)}`;
}

