import { NextResponse } from "next/server";
import { getLatestInsight } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const insight = await getLatestInsight(projectId);

  return NextResponse.json({ insight });
}

