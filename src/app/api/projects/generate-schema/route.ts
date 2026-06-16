import { NextResponse } from "next/server";
import { SchemaGenerationError } from "@/ai/generate-schema";
import { getOutputLanguage, getUiLanguage } from "@/lib/i18n";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { generateSchemaRequestSchema, invalidInput } from "@/lib/validation";

export async function POST(request: Request) {
  const limited = rateLimit({
    key: rateLimitKey(request, "generate-schema"),
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
  const normalizedBody =
    body && typeof body === "object"
      ? {
          ...body,
          outputLanguage:
            body.outputLanguage ??
            getOutputLanguage(
              body.questionnaireLanguage ?? body.language ?? body.lang,
              getUiLanguage(body.language ?? body.lang),
            ),
        }
      : body;
  const parsed = generateSchemaRequestSchema.safeParse(normalizedBody);

  if (!parsed.success) {
    return NextResponse.json(invalidInput(parsed.error), { status: 400 });
  }

  try {
    return NextResponse.json(
      await generateSchemaWithPpio(
        parsed.data.brief,
        parsed.data.outputLanguage,
      ),
    );
  } catch (error) {
    if (error instanceof SchemaGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Atpio could not generate the form right now." },
      { status: 502 },
    );
  }
}
