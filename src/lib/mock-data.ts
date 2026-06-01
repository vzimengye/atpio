import type { DataProject, InsightRun } from "./types";

export const sampleProject: DataProject = {
  id: "project_onboarding_feedback",
  name: "Onboarding Dropoff Feedback",
  brief:
    "Find out why users do not finish onboarding and which step feels confusing.",
  responseCount: 37,
  status: "collecting",
  updatedAt: "2026-06-01",
  schema: {
    title: "Onboarding Feedback",
    description:
      "A short feedback form for users who paused or exited onboarding.",
    fields: [
      {
        id: "dropoff_reason",
        type: "long_text",
        label: "What stopped you from completing onboarding?",
        required: true,
      },
      {
        id: "stuck_step",
        type: "single_select",
        label: "Where did you get stuck?",
        options: ["Account setup", "Permissions", "Product tour", "Other"],
      },
      {
        id: "confidence",
        type: "rating",
        label: "How confident did you feel about the next step?",
      },
    ],
  },
};

export const sampleInsightRun: InsightRun = {
  id: "run_mock_001",
  projectId: sampleProject.id,
  status: "completed",
  engine: "atpio-local",
  inputCount: 37,
  themes: [
    {
      name: "Users do not understand what permissions unlock",
      count: 14,
      summary:
        "Several responses mention uncertainty around why permissions are needed before the product value is clear.",
    },
    {
      name: "The product tour is too long before first value",
      count: 9,
      summary:
        "Users want to skip explanatory steps and see a working example earlier.",
    },
    {
      name: "Account setup has unclear error recovery",
      count: 6,
      summary:
        "Some users report not knowing how to recover after verification or setup errors.",
    },
  ],
};
