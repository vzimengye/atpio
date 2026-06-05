import "server-only";

import { generateSchemaFromBrief, projectNameFromBrief } from "./schema-generator";
import type { FieldType, ProjectSchema } from "./types";

type PpioSchemaResult = {
  name: string;
  schema: ProjectSchema;
  source: "ppio" | "local";
};

function extractJsonObject(content: string) {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("The model did not return a JSON object.");
  }

  return JSON.parse(content.slice(start, end + 1)) as {
    name?: string;
    schema?: ProjectSchema;
  };
}

function labelFromFieldId(fieldId: string) {
  return fieldId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeFieldType(type: unknown): FieldType {
  const value = String(type);
  if (
    value === "short_text" ||
    value === "long_text" ||
    value === "single_select" ||
    value === "multi_select" ||
    value === "rating" ||
    value === "boolean"
  ) {
    return value;
  }

  return "short_text";
}

function validateSchema(schema: ProjectSchema): ProjectSchema {
  if (!schema.title || !schema.description || !Array.isArray(schema.fields)) {
    throw new Error("Invalid schema shape.");
  }

  const pages = Array.isArray(schema.pages)
    ? schema.pages.slice(0, 5).map((page) => ({
        id: String(page.id).replace(/[^a-zA-Z0-9_]/g, "_"),
        title: String(page.title),
        description: page.description ? String(page.description) : undefined,
      }))
    : undefined;

  return {
    title: String(schema.title),
    description: String(schema.description),
    pages,
    fields: schema.fields.slice(0, 8).map((field, index) => {
      const looseField = field as typeof field & {
        key?: string;
        name?: string;
        question?: string;
        title?: string;
      };
      const rawId =
        looseField.id && String(looseField.id) !== "undefined"
          ? String(looseField.id)
          : looseField.key && String(looseField.key) !== "undefined"
            ? String(looseField.key)
            : looseField.name && String(looseField.name) !== "undefined"
              ? String(looseField.name)
          : `field_${index + 1}`;
      const id = rawId.replace(/[^a-zA-Z0-9_]/g, "_");
      const rawLabel =
        looseField.label ??
        looseField.question ??
        looseField.title ??
        looseField.name;

      return {
        id,
        type: normalizeFieldType(field.type),
        label:
          rawLabel && String(rawLabel) !== "undefined"
            ? String(rawLabel)
            : labelFromFieldId(id),
        required: Boolean(field.required),
        pageId: field.pageId
          ? String(field.pageId).replace(/[^a-zA-Z0-9_]/g, "_")
          : undefined,
        placeholder: field.placeholder ? String(field.placeholder) : undefined,
        validation: field.validation,
        options: Array.isArray(field.options)
          ? field.options.map((option) => String(option)).slice(0, 8)
          : undefined,
      };
    }),
  };
}

export async function generateSchemaWithPpio(
  brief: string,
): Promise<PpioSchemaResult> {
  const apiKey = process.env.PPIO_API_KEY;
  const baseUrl = process.env.PPIO_BASE_URL ?? "https://api.ppinfra.com/v3/openai";
  const model = process.env.PPIO_MODEL ?? "deepseek/deepseek-v3-turbo";
  const timeoutMs = Number(process.env.PPIO_TIMEOUT_MS ?? 12000);

  if (!apiKey) {
    return {
      name: projectNameFromBrief(brief),
      schema: generateSchemaFromBrief(brief),
      source: "local",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                'You design embedded data-gathering forms for Atpio. Return a valid JSON object only, with no markdown and no explanation. The top-level object must have "name" and "schema". schema must have "title", "description", optional "pages", and "fields". Use 3-6 fields for normal briefs and at most 8 fields. Every field must include a stable snake_case "id", a user-facing "label", "type", and "required". Allowed types are short_text, long_text, single_select, multi_select, rating, and boolean. Choice fields must include concise "options". Text fields should include helpful "placeholder" and validation.minLength or validation.maxLength when useful. Rating fields should use validation.min and validation.max, usually 1 and 5. If pages are used, every page needs id/title/description and every field pageId must match one page id. Example shape: {"name":"Onboarding Feedback","schema":{"title":"Onboarding Feedback","description":"Understand where users get stuck.","pages":[{"id":"experience","title":"Experience","description":"Where the user got stuck."}],"fields":[{"id":"dropoff_reason","type":"long_text","label":"What stopped you from completing onboarding?","required":true,"pageId":"experience","placeholder":"Tell us what felt unclear, slow, or blocked.","validation":{"minLength":8,"maxLength":600}}]}}',
            },
            {
              role: "user",
              content: `Create a data gathering form for this brief. Keep it concise, useful inside an embedded gadget, and split into pages only when helpful.\n\nBrief:\n${brief}`,
            },
          ],
        }),
      },
    ).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`PPIO request failed with ${response.status}.`);
    }

    const payload = await response.json();
    const content = String(payload.choices?.[0]?.message?.content ?? "");
    const parsed = extractJsonObject(content);

    return {
      name: parsed.name ? String(parsed.name) : projectNameFromBrief(brief),
      schema: validateSchema(parsed.schema ?? generateSchemaFromBrief(brief)),
      source: "ppio",
    };
  } catch {
    return {
      name: projectNameFromBrief(brief),
      schema: generateSchemaFromBrief(brief),
      source: "local",
    };
  }
}

