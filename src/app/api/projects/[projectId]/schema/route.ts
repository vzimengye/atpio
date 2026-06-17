import { NextResponse } from "next/server";
import { sampleProject } from "@/lib/mock-data";
import { forbiddenOriginResponse, isOriginAllowed } from "@/lib/domain-access";
import { getProject } from "@/lib/store";

const publicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (project && !isOriginAllowed(project, _request)) {
    return forbiddenOriginResponse(publicHeaders);
  }

  return NextResponse.json(
    {
      projectId,
      schema: project?.schema ?? sampleProject.schema,
      gadget: project?.gadget ?? sampleProject.gadget,
    },
    { headers: publicHeaders },
  );
}

export async function OPTIONS() {
  return new Response(null, { headers: publicHeaders, status: 204 });
}
