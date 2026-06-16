import { NextResponse } from "next/server";
import { forbiddenOriginResponse, isOriginAllowed } from "@/lib/domain-access";
import { logger } from "@/lib/logger";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { addResponse, getProject } from "@/lib/store";
import type { ProjectResponse } from "@/lib/types";
import { invalidInput, responseSubmissionSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const limited = rateLimit({
    key: rateLimitKey(request, `response:${projectId}`),
    limit: 30,
    windowMs: 60_000,
  });

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many responses. Try again shortly." },
      { status: 429 },
    );
  }

  const project = await getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (!isOriginAllowed(project, request)) {
    return forbiddenOriginResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = responseSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput(parsed.error), { status: 400 });
  }

  const now = new Date().toISOString();
  const response: ProjectResponse = {
    id: `response_${crypto.randomUUID()}`,
    projectId,
    answers: parsed.data.answers,
    sourceUrl: request.headers.get("referer") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    metadata:
      parsed.data.metadata
        ? Object.fromEntries(
            Object.entries(parsed.data.metadata).map(([key, value]) => [
              key,
              String(value),
            ]),
          )
        : undefined,
    createdAt: now,
  };

  await addResponse(response);
  logger.info({
    msg: "Response accepted",
    projectId,
    answerCount: Object.keys(response.answers).length,
  });

  return NextResponse.json({ response, status: "accepted" }, { status: 201 });
}
