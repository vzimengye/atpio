import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { projectIdFromName, projectNameFromBrief } from "@/lib/schema-generator";
import { listProjects, saveProject } from "@/lib/store";
import type { DataProject } from "@/lib/types";
import { createProjectRequestSchema, invalidInput } from "@/lib/validation";

export async function GET() {
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createProjectRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput(parsed.error), { status: 400 });
  }

  const { brief, schema: providedSchema } = parsed.data;
  const generated = providedSchema
    ? {
        name: projectNameFromBrief(brief),
        schema: providedSchema,
        source: "local" as const,
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

  await saveProject(project);
  logger.info({
    msg: "Project created",
    projectId: project.id,
    fieldCount: project.schema.fields.length,
  });

  return NextResponse.json({ project }, { status: 201 });
}
