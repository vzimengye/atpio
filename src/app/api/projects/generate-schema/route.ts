import { NextResponse } from "next/server";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const brief = String(body.brief ?? "").trim();

  if (!brief) {
    return NextResponse.json({ error: "Brief is required." }, { status: 400 });
  }

  return NextResponse.json(await generateSchemaWithPpio(brief));
}
