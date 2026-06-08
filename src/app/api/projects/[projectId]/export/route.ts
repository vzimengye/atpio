import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { logger } from "@/lib/logger";
import { exportProjectData } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { projectId } = await params;
  const exported = await exportProjectData(projectId, user.email ?? undefined);

  if (!exported) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  logger.info({
    msg: "Project data exported",
    projectId,
    responseCount: exported.responses.length,
  });

  return new Response(JSON.stringify(exported, null, 2), {
    headers: {
      "Content-Disposition": `attachment; filename="${projectId}-export.json"`,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
