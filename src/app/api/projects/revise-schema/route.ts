import { NextResponse } from "next/server";
import { SchemaGenerationError } from "@/ai/generate-schema";
import { reviseSchemaWithPpio } from "@/lib/ppio-schema";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { invalidInput, reviseSchemaRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limited = rateLimit({
    key: rateLimitKey(request, "revise-schema"),
    limit: 20,
    windowMs: 60_000,
  });

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = reviseSchemaRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(invalidInput(parsed.error), { status: 400 });
  }

  try {
    return NextResponse.json(
      await reviseSchemaWithPpio({
        brief: parsed.data.brief,
        currentSchema: parsed.data.schema,
        instructions: parsed.data.instructions,
      }),
    );
  } catch (error) {
    if (error instanceof SchemaGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Could not revise schema with PPIO." },
      { status: 502 },
    );
  }
}
