import { NextResponse } from "next/server";
import {
  generateSchemaFromBrief,
  projectNameFromBrief,
} from "@/lib/schema-generator";

export async function POST(request: Request) {
  const body = await request.json();
  const brief = String(body.brief ?? "").trim();

  if (!brief) {
    return NextResponse.json({ error: "Brief is required." }, { status: 400 });
  }

  return NextResponse.json({
    name: projectNameFromBrief(brief),
    schema: generateSchemaFromBrief(brief),
  });
}

