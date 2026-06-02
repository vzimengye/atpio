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
    pages: [
      {
        id: "experience",
        title: "Experience",
        description: "Understand where the user got stuck.",
      },
      {
        id: "follow_up",
        title: "Follow-up",
        description: "Capture permission for more detail.",
      },
    ],
    fields: [
      {
        id: "dropoff_reason",
        type: "long_text",
        label: "What stopped you from completing onboarding?",
        required: true,
        pageId: "experience",
        placeholder: "Tell us what felt unclear, slow, or blocked.",
        validation: { minLength: 8, maxLength: 600 },
      },
      {
        id: "stuck_step",
        type: "single_select",
        label: "Where did you get stuck?",
        options: ["Account setup", "Permissions", "Product tour", "Other"],
        pageId: "experience",
      },
      {
        id: "confidence",
        type: "rating",
        label: "How confident did you feel about the next step?",
        pageId: "follow_up",
        validation: { min: 1, max: 5 },
      },
    ],
  },
  gadget: {
    position: "bottom-right",
    theme: "light",
    buttonLabel: "Feedback",
    successMessage: "Thanks. Your feedback was saved.",
  },
};
