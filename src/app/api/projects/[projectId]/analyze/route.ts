import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { analyzeResponsesLocally } from "@/lib/local-analysis";
import { listResponses, saveInsight } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { projectId } = await params;
  const responses = await listResponses(projectId);
  const insight = analyzeResponsesLocally(projectId, responses);

  await saveInsight(insight);

  return NextResponse.json({ insight });
}
