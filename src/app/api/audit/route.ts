import { NextResponse } from "next/server";
import { listAuditEvents } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;

  return NextResponse.json({ auditEvents: await listAuditEvents(projectId) });
}

