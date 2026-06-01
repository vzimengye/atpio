import { NextResponse } from "next/server";
import { sampleProject } from "@/lib/mock-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  return NextResponse.json({
    projectId,
    schema: sampleProject.schema,
  });
}

