import { NextResponse } from "next/server";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { generateSchemaRequestSchema, invalidInput } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = generateSchemaRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput(parsed.error), { status: 400 });
  }

  return NextResponse.json(await generateSchemaWithPpio(parsed.data.brief));
}
