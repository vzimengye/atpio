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

function validateSchema(schema: ProjectSchema): ProjectSchema {
  if (!schema.title || !schema.description || !Array.isArray(schema.fields)) {
    throw new Error("Invalid schema shape.");
  }

  return {
    title: String(schema.title),
    description: String(schema.description),
    fields: schema.fields.slice(0, 8).map((field) => ({
      id: String(field.id).replace(/[^a-zA-Z0-9_]/g, "_"),
      type: field.type,
      label: String(field.label),
      required: Boolean(field.required),
      options: Array.isArray(field.options)
        ? field.options.map((option) => String(option)).slice(0, 8)
        : undefined,
    })),
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
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You generate compact JSON form schemas for Atpio. Return only JSON with keys name and schema. schema.fields must use type short_text, long_text, single_select, multi_select, rating, or boolean.",
          },
          {
            role: "user",
            content: `Create a data gathering form for this brief:\n${brief}`,
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

