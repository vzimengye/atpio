import { NextResponse } from "next/server";
import { analyzeResponsesLocally } from "@/lib/local-analysis";
import { listResponses, saveInsight } from "@/lib/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const responses = await listResponses(projectId);
  const insight = analyzeResponsesLocally(projectId, responses);

  await saveInsight(insight);

  return NextResponse.json({ insight });
}

