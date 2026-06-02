import "server-only";

import { generateSchemaFromBrief, projectNameFromBrief } from "./schema-generator";
import type { ProjectSchema } from "./types";

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
        type: field.type,
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

  if (!apiKey) {
    return {
      name: projectNameFromBrief(brief),
      schema: generateSchemaFromBrief(brief),
      source: "local",
    };
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You generate compact JSON form schemas for Atpio. Return a valid JSON object only, with no markdown and no explanation. The object must have keys name and schema. schema must have title, description, optional pages, and fields. schema.fields must use type short_text, long_text, single_select, multi_select, rating, or boolean, and may include pageId, placeholder, validation, required, and options.",
          },
          {
            role: "user",
            content: `Create a data gathering form for this brief. Keep it concise, useful inside an embedded gadget, and split into pages only when helpful.\n\nBrief:\n${brief}`,
          },
        ],
      }),
    });

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

