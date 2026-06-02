import { NextResponse } from "next/server";
import { addResponse } from "@/lib/store";
import type { ProjectResponse } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json();
  const now = new Date().toISOString();
  const response: ProjectResponse = {
    id: `response_${Date.now()}`,
    projectId,
    answers: body.answers ?? {},
    sourceUrl: request.headers.get("referer") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    metadata:
      body.metadata && typeof body.metadata === "object"
        ? Object.fromEntries(
            Object.entries(body.metadata).map(([key, value]) => [
              key,
              String(value),
            ]),
          )
        : undefined,
    createdAt: now,
  };

  await addResponse(response);

  return NextResponse.json({ response, status: "accepted" }, { status: 201 });
}
