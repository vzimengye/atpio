import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderStandaloneHtml } from "@/lib/standalone-html";
import { getProject } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProject(projectId, session.user.email ?? undefined);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const html = renderStandaloneHtml(project);

  return new Response(html, {
    headers: {
      "Content-Disposition": `attachment; filename="${project.id}.html"`,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
