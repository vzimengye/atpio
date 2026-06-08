import { NextResponse } from "next/server";
import { sampleProject } from "@/lib/mock-data";
import { forbiddenOriginResponse, isOriginAllowed } from "@/lib/domain-access";
import { getProject } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (project && !isOriginAllowed(project, _request)) {
    return forbiddenOriginResponse();
  }

  return NextResponse.json({
    projectId,
    schema: project?.schema ?? sampleProject.schema,
  });
}
