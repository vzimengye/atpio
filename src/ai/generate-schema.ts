import "server-only";

import { generateObject } from "ai";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { generateSchemaFromBrief, projectNameFromBrief } from "@/lib/schema-generator";
import type { ProjectSchema } from "@/lib/types";
import { ppio } from "./provider";
import { schemaGenerationPrompt } from "./prompt/schema-generation";

const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "single_select",
  "multi_select",
  "rating",
  "boolean",
]);

const formPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

const formFieldSchema = z.object({
  id: z.string(),
  type: fieldTypeSchema,
  label: z.string(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  pageId: z.string().optional(),
  placeholder: z.string().optional(),
  validation: z
    .object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

const projectSchemaOutput = z.object({
  name: z.string(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pages: z.array(formPageSchema).max(5).optional(),
    fields: z.array(formFieldSchema).min(4).max(12),
  }),
});

export type GeneratedSchemaResult = {
  name: string;
  schema: ProjectSchema;
  source: "ppio" | "local";
};

export type QuestionnaireLanguage = "zh" | "en" | "bilingual";

export class SchemaGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaGenerationError";
  }
}

function localSchemaResult(brief: string): GeneratedSchemaResult {
  return {
    name: projectNameFromBrief(brief),
    schema: generateSchemaFromBrief(brief),
    source: "local",
  };
}

function cleanId(value: string) {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}

function normalizeSchema(schema: ProjectSchema): ProjectSchema {
  const pages = schema.pages?.map((page) => ({
    ...page,
    id: cleanId(page.id),
  }));

  return {
    ...schema,
    pages,
    fields: schema.fields.map((field) => ({
      ...field,
      id: cleanId(field.id),
      pageId: field.pageId ? cleanId(field.pageId) : undefined,
      options: field.options?.slice(0, 8),
    })),
  };
}

export async function generateSchema({
  allowLocalFallback = false,
  brief,
  outputLanguage = "en",
}: {
  allowLocalFallback?: boolean;
  brief: string;
  outputLanguage?: QuestionnaireLanguage;
}): Promise<GeneratedSchemaResult> {
  logger.info({ msg: "Generating schema", briefLength: brief.length });

  if (!process.env.PPIO_API_KEY) {
    logger.error({ msg: "PPIO schema generation unavailable", reason: "missing_api_key" });
    if (allowLocalFallback) return localSchemaResult(brief);
    throw new SchemaGenerationError("PPIO_API_KEY is missing.");
  }

  try {
    const model = process.env.PPIO_MODEL ?? "deepseek/deepseek-v3-turbo";
    const { object } = await generateObject({
      model: ppio.chat(model),
      schema: projectSchemaOutput,
      system: schemaGenerationPrompt,
      prompt: `Create a data gathering form for this brief. Make the questions rich, specific, and varied while still usable inside an embedded gadget. Split into pages when helpful.

Questionnaire language:
${languageInstruction(outputLanguage)}

Return an object with this shape:
{
  "name": "short project name",
  "schema": {
    "title": "form title",
    "description": "form description",
    "pages": [{"id": "page_id", "title": "Page title", "description": "optional"}],
    "fields": [
      {
        "id": "stable_snake_case_id",
        "type": "short_text | long_text | single_select | multi_select | rating | boolean",
        "label": "question label",
        "required": true,
        "options": ["for choice fields only"],
        "pageId": "matching page id",
        "placeholder": "optional",
        "validation": {"minLength": 0, "maxLength": 500, "min": 1, "max": 5}
      }
    ]
  }
}

Question design requirements:
- Prefer 6-9 fields for normal briefs. Use up to 12 when the brief has multiple dimensions.
- Include a mix of field types when useful: single_select, multi_select, rating, short_text, long_text, and boolean.
- Cover multiple data dimensions, such as current behavior, preference, reason, context, constraints, tradeoffs, frequency, satisfaction, and follow-up willingness.
- Avoid generic questions like "What is the most important thing you want us to know?" unless the brief is truly generic.
- Choice options should be concrete and brief, usually 4-7 options.
- Put related questions into 2-4 pages so the preview feels organized.
Follow the requested questionnaire language exactly for every user-facing string: name, title, description, page titles, field labels, placeholders, and options.

Brief:
${brief}`,
      temperature: 0.35,
    });
    const result: GeneratedSchemaResult = {
      name: object.name || projectNameFromBrief(brief),
      schema: normalizeSchema(object.schema),
      source: "ppio",
    };
    logger.info({
      msg: "Schema generated",
      fieldCount: result.schema.fields.length,
      source: result.source,
    });
    return result;
  } catch (error) {
    logger.error({
      msg: "PPIO schema generation failed",
      error,
    });
    if (!allowLocalFallback) {
      throw new SchemaGenerationError(
        "Atpio could not generate the form right now. Please try again in a moment.",
      );
    }
    return localSchemaResult(brief);
  }
}

export async function reviseSchema({
  brief,
  currentSchema,
  instructions,
  outputLanguage = "en",
}: {
  brief: string;
  currentSchema: ProjectSchema;
  instructions: string;
  outputLanguage?: QuestionnaireLanguage;
}): Promise<GeneratedSchemaResult> {
  logger.info({
    msg: "Revising schema",
    briefLength: brief.length,
    instructionLength: instructions.length,
    fieldCount: currentSchema.fields.length,
  });

  if (!process.env.PPIO_API_KEY) {
    logger.error({ msg: "PPIO schema revision unavailable", reason: "missing_api_key" });
    throw new SchemaGenerationError("PPIO_API_KEY is missing.");
  }

  try {
    const model = process.env.PPIO_MODEL ?? "deepseek/deepseek-v3-turbo";
    const { object } = await generateObject({
      model: ppio.chat(model),
      schema: projectSchemaOutput,
      system: schemaGenerationPrompt,
      prompt: `Revise this existing Atpio questionnaire based on the user's instructions.

Preserve useful existing questions and manual edits. Make targeted improvements instead of starting over unless the user explicitly asks for a full rewrite.

Questionnaire language:
${languageInstruction(outputLanguage)}

Return an object with this shape:
{
  "name": "short project name",
  "schema": {
    "title": "form title",
    "description": "form description",
    "pages": [{"id": "page_id", "title": "Page title", "description": "optional"}],
    "fields": [
      {
        "id": "stable_snake_case_id",
        "type": "short_text | long_text | single_select | multi_select | rating | boolean",
        "label": "question label",
        "required": true,
        "options": ["for choice fields only"],
        "pageId": "matching page id",
        "placeholder": "optional",
        "validation": {"minLength": 0, "maxLength": 500, "min": 1, "max": 5}
      }
    ]
  }
}

Revision requirements:
- Apply the user's instructions concretely.
- Keep the questionnaire coherent, usable, and not overly long.
- Prefer 6-12 fields when the user asks for richer coverage.
- Use varied field types when helpful.
- Follow the requested questionnaire language exactly for every user-facing string.
- Keep stable IDs for unchanged questions when possible.
- Ensure every field pageId matches an existing page id if pages are used.

Original brief:
${brief}

Current schema:
${JSON.stringify(currentSchema, null, 2)}

User revision instructions:
${instructions}`,
      temperature: 0.3,
    });
    const result: GeneratedSchemaResult = {
      name: object.name || projectNameFromBrief(brief),
      schema: normalizeSchema(object.schema),
      source: "ppio",
    };
    logger.info({
      msg: "Schema revised",
      fieldCount: result.schema.fields.length,
      source: result.source,
    });
    return result;
  } catch (error) {
    logger.error({
      msg: "PPIO schema revision failed",
      error,
    });
    throw new SchemaGenerationError(
      "Atpio could not revise the form right now. Please try again in a moment.",
    );
  }
}

function languageInstruction(language: QuestionnaireLanguage) {
  if (language === "zh") {
    return "Generate all user-facing questionnaire text in Simplified Chinese.";
  }

  if (language === "bilingual") {
    return "Generate bilingual user-facing text with Chinese first, then English in parentheses, for example: 您最看重什么？ (What matters most to you?)";
  }

  return "Generate all user-facing questionnaire text in English.";
}
