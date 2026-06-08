import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getProject, listResponses, saveProject } from "@/lib/store";
import type { DataProject } from "@/lib/types";
import { invalidInput, updateProjectRequestSchema } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({
    project,
    responses: await listResponses(projectId),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const existing = await getProject(projectId);

  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = updateProjectRequestSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(invalidInput(parsed.error), { status: 400 });
  }

  const body = parsed.data;
  const patch: Partial<DataProject> = {};

  if (body.name) patch.name = body.name;
  if (body.brief) patch.brief = body.brief;
  if (body.schema) patch.schema = body.schema;
  if (body.gadget) {
    patch.gadget = {
      ...existing.gadget,
      ...body.gadget,
    };
  }

  const project = await saveProject({
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString().slice(0, 10),
  });
  logger.info({ msg: "Project updated", projectId: project.id });

  return NextResponse.json({ project });
}
