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
    fields: z.array(formFieldSchema).min(1).max(8),
  }),
});

export type GeneratedSchemaResult = {
  name: string;
  schema: ProjectSchema;
  source: "ppio" | "local";
};

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
  brief,
}: {
  brief: string;
}): Promise<GeneratedSchemaResult> {
  logger.info({ msg: "Generating schema", briefLength: brief.length });

  if (!process.env.PPIO_API_KEY) {
    logger.info({ msg: "Using local schema generator", reason: "missing_api_key" });
    return localSchemaResult(brief);
  }

  try {
    const model = process.env.PPIO_MODEL ?? "deepseek/deepseek-v3-turbo";
    const { object } = await generateObject({
      model: ppio(model),
      schema: projectSchemaOutput,
      system: schemaGenerationPrompt,
      prompt: `Create a data gathering form for this brief. Keep it concise, useful inside an embedded gadget, and split into pages only when helpful.\n\nBrief:\n${brief}`,
      temperature: 0.2,
      maxRetries: 2,
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
      msg: "LLM schema generation failed, using local fallback",
      error,
    });
    return localSchemaResult(brief);
  }
}
