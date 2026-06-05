import { NextResponse } from "next/server";
import { listProjects } from "@/lib/store";

const publicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export async function GET() {
  const projects = await listProjects();
  const latestProject = projects[0] ?? null;

  return NextResponse.json(
    { project: latestProject },
    { headers: publicHeaders },
  );
}

export async function OPTIONS() {
  return new Response(null, { headers: publicHeaders, status: 204 });
}
