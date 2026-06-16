import { NextResponse } from "next/server";
import { SchemaGenerationError } from "@/ai/generate-schema";
import { requireAdmin } from "@/lib/auth-guard";
import { defaultGadgetSettings } from "@/lib/gadget-defaults";
import { getOutputLanguage, getUiLanguage } from "@/lib/i18n";
import { logger } from "@/lib/logger";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { projectIdFromName, projectNameFromBrief } from "@/lib/schema-generator";
import { listProjects, saveProject } from "@/lib/store";
import type { DataProject } from "@/lib/types";
import { createProjectRequestSchema, invalidInput } from "@/lib/validation";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return NextResponse.json({
    projects: await listProjects(user.email ?? undefined),
  });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const normalizedBody =
    body && typeof body === "object"
      ? {
          ...body,
          outputLanguage:
            body.outputLanguage ??
            getOutputLanguage(
              body.questionnaireLanguage ?? body.language ?? body.lang,
              getUiLanguage(body.language ?? body.lang),
            ),
        }
      : body;
  const parsed = createProjectRequestSchema.safeParse(normalizedBody);

  if (!parsed.success) {
    return NextResponse.json(invalidInput(parsed.error), { status: 400 });
  }

  const { brief, schema: providedSchema } = parsed.data;
  let generated;
  try {
    generated = providedSchema
      ? {
          name: projectNameFromBrief(brief),
          schema: providedSchema,
          source: "local" as const,
        }
      : await generateSchemaWithPpio(brief, parsed.data.outputLanguage);
  } catch (error) {
    if (error instanceof SchemaGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Atpio could not generate the form right now." },
      { status: 502 },
    );
  }
  const name = (parsed.data.name || generated.name || projectNameFromBrief(brief)).trim();
  const now = new Date().toISOString();
  const project: DataProject = {
    id: projectIdFromName(name),
    name,
    brief,
    schema: generated.schema,
    gadget: defaultGadgetSettings,
    responseCount: 0,
    status: "draft",
    updatedAt: now.slice(0, 10),
    ownerEmail: user.email ?? undefined,
  };

  await saveProject(project);
  logger.info({
    msg: "Project created",
    projectId: project.id,
    fieldCount: project.schema.fields.length,
  });

  return NextResponse.json({ project }, { status: 201 });
}
