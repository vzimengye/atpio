"use server";

import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth-guard";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { projectIdFromName, projectNameFromBrief } from "@/lib/schema-generator";
import { getProject, saveProject } from "@/lib/store";
import type { DataProject } from "@/lib/types";
import {
  createProjectRequestSchema,
  updateProjectRequestSchema,
} from "@/lib/validation";

export async function createProjectAction(input: unknown) {
  const user = await requireAdmin();
  if (!user) return { error: "Unauthorized." };

  const parsed = createProjectRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const { brief, schema: providedSchema } = parsed.data;
  const generated = providedSchema
    ? {
        name: projectNameFromBrief(brief),
        schema: providedSchema,
      }
    : await generateSchemaWithPpio(brief);
  const name = (parsed.data.name || generated.name || projectNameFromBrief(brief)).trim();
  const now = new Date().toISOString();
  const project: DataProject = {
    id: projectIdFromName(name),
    name,
    brief,
    schema: generated.schema,
    gadget: {
      position: "bottom-right",
      theme: "light",
      buttonLabel: "Feedback",
      successMessage: "Thanks. Your feedback was saved.",
      brandColor: "#020617",
      accentColor: "#10b981",
      buttonShape: "pill",
      fontFamily: "Inter, Arial, sans-serif",
    },
    responseCount: 0,
    status: "draft",
    updatedAt: now.slice(0, 10),
  };

  const saved = await saveProject(project);
  logger.info({
    msg: "Project created",
    projectId: saved.id,
    fieldCount: saved.schema.fields.length,
  });

  return { project: saved };
}

export async function updateProjectAction(projectId: string, input: unknown) {
  const user = await requireAdmin();
  if (!user) return { error: "Unauthorized." };

  const existing = await getProject(projectId);

  if (!existing) {
    return { error: "Project not found." };
  }

  const parsed = updateProjectRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const body = parsed.data;
  const project = await saveProject({
    ...existing,
    ...(body.name ? { name: body.name } : {}),
    ...(body.brief ? { brief: body.brief } : {}),
    ...(body.schema ? { schema: body.schema } : {}),
    ...(body.gadget ? { gadget: { ...existing.gadget, ...body.gadget } } : {}),
    updatedAt: new Date().toISOString().slice(0, 10),
  });
  logger.info({ msg: "Project updated", projectId: project.id });

  return { project };
}
