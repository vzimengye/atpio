import { NextResponse } from "next/server";
import { getProject, listResponses, saveProject } from "@/lib/store";
import type { DataProject, GadgetSettings, ProjectSchema } from "@/lib/types";

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

  const body = await request.json();
  const patch: Partial<DataProject> = {};

  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.brief === "string") patch.brief = body.brief.trim();
  if (body.schema) patch.schema = body.schema as ProjectSchema;
  if (body.gadget) {
    patch.gadget = {
      ...existing.gadget,
      ...(body.gadget as Partial<GadgetSettings>),
    };
  }

  const project = await saveProject({
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString().slice(0, 10),
  });

  return NextResponse.json({ project });
}
