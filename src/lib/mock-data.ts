import type { DataProject } from "./types";

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
