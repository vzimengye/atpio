import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/auth-guard";
import { listAuditEvents } from "@/lib/store";

export async function GET(request: Request) {
  const unauthorized = await requireAdminResponse();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;

  return NextResponse.json({ auditEvents: await listAuditEvents(projectId) });
}

