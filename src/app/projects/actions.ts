"use server";

import { logger } from "@/lib/logger";
import { SchemaGenerationError } from "@/ai/generate-schema";
import { requireAdmin } from "@/lib/auth-guard";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { projectIdFromName, projectNameFromBrief } from "@/lib/schema-generator";
import { getProject, saveProject, setActiveProjectForUser } from "@/lib/store";
import type { DataProject } from "@/lib/types";
import {
  createProjectRequestSchema,
  updateProjectRequestSchema,
} from "@/lib/validation";

export async function createProjectAction(input: unknown) {
  const user = await requireAdmin();
  if (!user) return { error: "Unauthorized." };
  const ownerEmail = user.email ?? undefined;

  const parsed = createProjectRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const { brief, schema: providedSchema } = parsed.data;
  let generated;
  try {
    generated = providedSchema
      ? {
          name: projectNameFromBrief(brief),
          schema: providedSchema,
        }
      : await generateSchemaWithPpio(brief);
  } catch (error) {
    if (error instanceof SchemaGenerationError) {
      return { error: error.message };
    }
    return { error: "Could not generate schema with PPIO." };
  }
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
    ownerEmail,
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

  const existing = await getProject(projectId, user.email ?? undefined);

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

export async function setActiveProjectAction(projectId: string) {
  const user = await requireAdmin();
  if (!user?.email) return { error: "Unauthorized." };

  const updated = await setActiveProjectForUser(user.email, projectId);
  if (!updated) return { error: "Project not found." };

  return { activeProjectId: updated.activeProjectId };
}
