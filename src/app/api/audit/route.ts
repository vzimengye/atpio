import { NextResponse } from "next/server";
import { requireAdmin, requireAdminResponse } from "@/lib/auth-guard";
import { getProject, listAuditEvents } from "@/lib/store";

export async function GET(request: Request) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;
  const user = await requireAdmin();

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;

  if (projectId) {
    const project = await getProject(projectId, user?.email ?? undefined);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
  }

  return NextResponse.json({
    auditEvents: await listAuditEvents(projectId, user?.email ?? undefined),
  });
}

