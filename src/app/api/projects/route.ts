import { NextResponse } from "next/server";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { projectIdFromName, projectNameFromBrief } from "@/lib/schema-generator";
import { listProjects, saveProject } from "@/lib/store";
import type { DataProject, ProjectSchema } from "@/lib/types";

const publicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  return NextResponse.json(
    { projects: await listProjects() },
    { headers: publicHeaders },
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicHeaders });
}

export async function POST(request: Request) {
  const body = await request.json();
  const brief = String(body.brief ?? "").trim();

  if (!brief) {
    return NextResponse.json(
      { error: "Brief is required." },
      { headers: publicHeaders, status: 400 },
    );
  }

  const providedSchema = body.schema as ProjectSchema | undefined;
  const generated = providedSchema
    ? {
        name: projectNameFromBrief(brief),
        schema: providedSchema,
        source: "local" as const,
      }
    : await generateSchemaWithPpio(brief);
  const name = String(body.name || generated.name || projectNameFromBrief(brief)).trim();
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

  return NextResponse.json({ project }, { headers: publicHeaders, status: 201 });
}
