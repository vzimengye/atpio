import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "single_select",
  "multi_select",
  "rating",
  "boolean",
]);

export const formPageSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  description: z.string().max(500).optional(),
});

export const formFieldSchema = z.object({
  id: z.string().min(1).max(80),
  type: fieldTypeSchema,
  label: z.string().min(1).max(240),
  required: z.boolean().optional(),
  options: z.array(z.string().min(1).max(120)).max(12).optional(),
  pageId: z.string().min(1).max(80).optional(),
  placeholder: z.string().max(240).optional(),
  validation: z
    .object({
      minLength: z.number().int().min(0).optional(),
      maxLength: z.number().int().min(1).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

export const projectSchemaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(800),
  pages: z.array(formPageSchema).max(8).optional(),
  fields: z.array(formFieldSchema).min(1).max(24),
});

export const gadgetSettingsSchema = z.object({
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .optional(),
  theme: z.enum(["light", "dark"]).optional(),
  buttonLabel: z.string().min(1).max(80).optional(),
  successMessage: z.string().min(1).max(240).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonShape: z.enum(["pill", "rounded", "square"]).optional(),
  fontFamily: z.string().min(1).max(160).optional(),
  allowedDomains: z.array(z.string().min(1).max(240)).max(20).optional(),
});

export const generateSchemaRequestSchema = z.object({
  brief: z.string().trim().min(1).max(2000),
});

export const reviseSchemaRequestSchema = z.object({
  brief: z.string().trim().min(1).max(2000),
  instructions: z.string().trim().min(1).max(2000),
  schema: projectSchemaSchema,
});

export const createProjectRequestSchema = z.object({
  brief: z.string().trim().min(1).max(2000),
  name: z.string().trim().max(160).optional(),
  schema: projectSchemaSchema.optional(),
});

export const updateProjectRequestSchema = z.object({
  brief: z.string().trim().min(1).max(2000).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  schema: projectSchemaSchema.optional(),
  gadget: gadgetSettingsSchema.optional(),
});

export const registerUserSchema = z.object({
  email: z.string().trim().email().max(240),
  name: z.string().trim().max(120).optional(),
  password: z.string().min(8).max(200),
});

const answerValueSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.boolean(),
]);

export const responseSubmissionSchema = z.object({
  answers: z.record(z.string(), answerValueSchema),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export function invalidInput(error: z.ZodError) {
  return {
    error: "Invalid input.",
    details: error.flatten(),
  };
}
