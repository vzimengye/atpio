import { NextResponse } from "next/server";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { projectIdFromName, projectNameFromBrief } from "@/lib/schema-generator";
import { listProjects, saveProject } from "@/lib/store";
import type { DataProject } from "@/lib/types";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const brief = String(body.brief ?? "").trim();

  if (!brief) {
    return NextResponse.json({ error: "Brief is required." }, { status: 400 });
  }

  const name = String(body.name ?? projectNameFromBrief(brief)).trim();
  const generated = await generateSchemaWithPpio(brief);
  const now = new Date().toISOString();
  const project: DataProject = {
    id: projectIdFromName(name),
    name,
    brief,
    schema: generated.schema,
    responseCount: 0,
    status: "draft",
    updatedAt: now.slice(0, 10),
  };

  await saveProject(project);

  return NextResponse.json({ project }, { status: 201 });
}
