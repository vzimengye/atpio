import { describe, expect, it } from "vitest";
import {
  generateSchemaFromBrief,
  projectIdFromName,
  projectNameFromBrief,
} from "../schema-generator";

describe("generateSchemaFromBrief", () => {
  it("generates an AI-specific schema for AI-related briefs", () => {
    const result = generateSchemaFromBrief("help me choose an AI model");

    expect(result.title).toBe("AI Selection Feedback");
    expect(result.fields.length).toBeGreaterThan(0);
    expect(result.fields.some((field) => field.id === "current_ai_tool")).toBe(
      true,
    );
  });

  it("returns a generic feedback form for unrecognized briefs", () => {
    const result = generateSchemaFromBrief("general product feedback");

    expect(result.title).toBe("Product Feedback");
    expect(result.fields.some((field) => field.id === "main_feedback")).toBe(
      true,
    );
  });

  it("adds reason and rating fields when the brief asks why and confidence", () => {
    const result = generateSchemaFromBrief(
      "Find out why users feel low confidence during onboarding",
    );

    expect(result.fields.some((field) => field.id === "reason")).toBe(true);
    expect(result.fields.some((field) => field.id === "rating")).toBe(true);
  });

  it("generates a meal preference schema for Chinese breakfast briefs", () => {
    const result = generateSchemaFromBrief(
      "早餐会选择吃什么？中餐西餐？什么口味多少量？",
    );

    expect(result.title).toBe("Meal Preference Survey");
    expect(result.fields.some((field) => field.id === "meal_style")).toBe(true);
    expect(result.fields.some((field) => field.id === "flavor_preference")).toBe(
      true,
    );
    expect(result.fields.some((field) => field.id === "portion_size")).toBe(true);
  });
});

describe("project naming helpers", () => {
  it("generates a project name from the inferred title", () => {
    expect(projectNameFromBrief("onboarding dropoff")).toBe(
      "Onboarding Feedback Project",
    );
  });

  it("generates a stable project ID prefix from a name", () => {
    expect(projectIdFromName("My Project!")).toMatch(/^project_my_project_/);
  });
});
