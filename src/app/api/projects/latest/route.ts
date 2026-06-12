import { NextResponse } from "next/server";
import { getActiveProjectForPublicKey, listProjects } from "@/lib/store";

const publicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceKey = url.searchParams.get("workspaceKey")?.trim();
  const latestProject = workspaceKey
    ? await getActiveProjectForPublicKey(workspaceKey)
    : (await listProjects())[0] ?? null;

  return NextResponse.json(
    { project: latestProject },
    { headers: publicHeaders },
  );
}

export async function OPTIONS() {
  return new Response(null, { headers: publicHeaders, status: 204 });
}
