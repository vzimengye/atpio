import { NextResponse } from "next/server";
import { SchemaGenerationError } from "@/ai/generate-schema";
import { requireAdmin } from "@/lib/auth-guard";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { projectIdFromName, projectNameFromBrief } from "@/lib/schema-generator";
import { saveProject } from "@/lib/store";
import type { DataProject, ProjectSchema } from "@/lib/types";

function parseSchema(value: FormDataEntryValue | null): ProjectSchema | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;

  try {
    const parsed = JSON.parse(value) as ProjectSchema;
    if (!parsed.title || !parsed.description || !Array.isArray(parsed.fields)) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const brief = String(formData.get("brief") ?? "").trim();
  const fallbackUrl = new URL("/projects/new", request.url);

  if (!brief) {
    fallbackUrl.searchParams.set("error", "brief_required");
    return NextResponse.redirect(fallbackUrl, { status: 303 });
  }

  const providedSchema = parseSchema(formData.get("schema"));
  let generated;
  try {
    generated = providedSchema
      ? {
          name: projectNameFromBrief(brief),
          schema: providedSchema,
        }
      : await generateSchemaWithPpio(brief);
  } catch (error) {
    fallbackUrl.searchParams.set(
      "error",
      error instanceof SchemaGenerationError ? "ppio_failed" : "schema_failed",
    );
    return NextResponse.redirect(fallbackUrl, { status: 303 });
  }
  const name = String(
    formData.get("name") || generated.name || projectNameFromBrief(brief),
  ).trim();
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

  const nextUrl = new URL("/projects/new", request.url);
  nextUrl.searchParams.set("name", name);
  nextUrl.searchParams.set("brief", brief);
  nextUrl.searchParams.set("saved", project.id);
  return NextResponse.redirect(nextUrl, { status: 303 });
}
