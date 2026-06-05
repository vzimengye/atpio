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

  if (/ai|model|assistant|llm|人工智能|模型|助手/i.test(normalized)) {
    return "AI Selection Feedback";
  }

  return "Product Feedback";
}

export function generateSchemaFromBrief(brief: string): ProjectSchema {
  const title = titleFromBrief(brief);
  const lowerBrief = brief.toLowerCase();

  if (
    lowerBrief.includes("ai") ||
    lowerBrief.includes("model") ||
    lowerBrief.includes("人工智能") ||
    lowerBrief.includes("模型") ||
    lowerBrief.includes("助手")
  ) {
    return {
      title,
      description:
        "Understand how users choose AI tools and what tradeoffs matter most.",
      pages: [
        {
          id: "current_use",
          title: "Current AI use",
          description: "Learn what the user uses today and the job it supports.",
        },
        {
          id: "decision_factors",
          title: "Decision factors",
          description: "Capture the criteria behind the user's choice.",
        },
        {
          id: "switching",
          title: "Switching signals",
          description: "Find out what would make the user try or switch tools.",
        },
      ],
      fields: [
        {
          id: "current_ai_tool",
          type: "short_text",
          label: "Which AI tool do you use most often right now?",
          required: true,
          pageId: "current_use",
          placeholder: "For example: ChatGPT, Claude, Gemini, Copilot, DeepSeek",
          validation: { minLength: 2, maxLength: 80 },
        },
        {
          id: "primary_use_case",
          type: "single_select",
          label: "What do you mainly use it for?",
          required: true,
          options: [
            "Writing or editing",
            "Coding",
            "Research or learning",
            "Work automation",
            "Image or media generation",
            "Personal questions",
            "Other",
          ],
          pageId: "current_use",
        },
        {
          id: "selection_criteria",
          type: "multi_select",
          label: "Which factors matter most when choosing an AI tool?",
          required: true,
          options: [
            "Answer quality",
            "Speed",
            "Price",
            "Privacy",
            "Context length",
            "Tool integrations",
            "Brand trust",
          ],
          pageId: "decision_factors",
        },
        {
          id: "main_reason",
          type: "long_text",
          label: "What is the main reason you prefer that AI tool?",
          required: true,
          pageId: "decision_factors",
          placeholder: "Describe the tradeoff or moment that made it feel better.",
          validation: { minLength: 8, maxLength: 500 },
        },
        {
          id: "switch_trigger",
          type: "long_text",
          label: "What would make you switch to a different AI tool?",
          required: false,
          pageId: "switching",
          placeholder: "Mention missing features, trust issues, pricing, quality, or workflow fit.",
          validation: { maxLength: 500 },
        },
      ],
    };
  }

  const fields: ProjectSchema["fields"] = [
    {
      id: "main_feedback",
      type: "long_text",
      label: "What is the most important thing you want us to know?",
      required: true,
      pageId: "core",
      placeholder: "Share the main issue, request, or observation.",
      validation: { minLength: 8, maxLength: 800 },
    },
  ];

  if (lowerBrief.includes("why") || lowerBrief.includes("为什么")) {
    fields.push({
      id: "reason",
      type: "long_text",
      label: "What was the main reason behind this?",
      required: true,
      pageId: "core",
      placeholder: "Add context that would help the product team act.",
      validation: { minLength: 6, maxLength: 600 },
    });
  }

  if (lowerBrief.includes("step") || lowerBrief.includes("onboarding")) {
    fields.push({
      id: "stuck_step",
      type: "single_select",
      label: "Where did you get stuck?",
      options: ["Account setup", "Permissions", "Product tour", "Other"],
      pageId: "details",
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
      pageId: "details",
      validation: { min: 1, max: 5 },
    });
  }

  fields.push({
    id: "follow_up",
    type: "boolean",
    label: "May we follow up if we need more detail?",
    pageId: "follow_up",
  });

  return {
    title,
    description:
      "A lightweight Atpio form generated from the project brief.",
    pages: [
      {
        id: "core",
        title: "Core feedback",
        description: "Collect the most important signal first.",
      },
      {
        id: "details",
        title: "Details",
        description: "Add structured context when useful.",
      },
      {
        id: "follow_up",
        title: "Follow-up",
        description: "Ask whether the team can ask for more context.",
      },
    ],
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

