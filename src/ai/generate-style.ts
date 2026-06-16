import "server-only";

import { generateText } from "ai";
import { z } from "zod";
import { ppio } from "@/ai/provider";
import { defaultGadgetSettings, withGadgetDefaults } from "@/lib/gadget-defaults";
import { logger } from "@/lib/logger";
import type { GadgetSettings } from "@/lib/types";
import { gadgetSettingsSchema } from "@/lib/validation";

const styleOutputSchema = z.object({
  gadget: gadgetSettingsSchema,
  rationale: z.string().max(600).optional(),
});

export class StyleGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StyleGenerationError";
  }
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new StyleGenerationError("PPIO returned text without a JSON object.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

export async function generateStyle({
  currentGadget,
  fileName,
  instructions,
  source,
}: {
  currentGadget?: Partial<GadgetSettings>;
  fileName?: string;
  instructions: string;
  source: "prompt" | "upload";
}) {
  logger.info({
    msg: "Generating feedback style",
    instructionLength: instructions.length,
    source,
  });

  if (!process.env.PPIO_API_KEY) {
    throw new StyleGenerationError("PPIO_API_KEY is missing.");
  }

  try {
    const model = process.env.PPIO_MODEL ?? "deepseek/deepseek-v3-turbo";
    const { text } = await generateText({
      model: ppio.chat(model),
      system:
        "You are Atpio's UI theme designer. Convert brand/style guidance into safe theme tokens for an embedded HTML feedback experience. Do not write arbitrary HTML or CSS. Return only JSON.",
      prompt: `Current Atpio theme:
${JSON.stringify(withGadgetDefaults(currentGadget), null, 2)}

Style source: ${source}
${fileName ? `Uploaded file name: ${fileName}` : ""}

User or document guidance:
${instructions}

Return only valid JSON:
{
  "gadget": {
    "theme": "light | dark",
    "buttonLabel": "short CTA",
    "successMessage": "short success message",
    "brandColor": "#000000",
    "accentColor": "#000000",
    "backgroundColor": "#000000",
    "textColor": "#000000",
    "borderColor": "#000000",
    "buttonShape": "pill | rounded | square",
    "buttonStyle": "filled | outline | soft",
    "density": "compact | comfortable | spacious",
    "fontFamily": "CSS font stack",
    "inputStyle": "outlined | filled | underline",
    "shadow": "none | soft | strong",
    "styleSource": "${source}",
    "styleReferenceFileName": "optional uploaded file name"
  },
  "rationale": "one short sentence"
}

Rules:
- Preserve functional settings like position and allowedDomains unless the user explicitly asks.
- Use accessible contrast.
- Prefer hex colors.
- If the guidance is vague, choose a polished modern SaaS style.
- Never include CSS classes, scripts, markdown, or prose outside JSON.`,
      temperature: 0.25,
    });

    const object = styleOutputSchema.parse(extractJsonObject(text));
    return {
      gadget: {
        ...defaultGadgetSettings,
        ...currentGadget,
        ...object.gadget,
        styleReferenceFileName: fileName ?? object.gadget.styleReferenceFileName,
        styleSource: source,
      } satisfies GadgetSettings,
      rationale: object.rationale,
    };
  } catch (error) {
    logger.error({ msg: "Feedback style generation failed", error });
    if (error instanceof StyleGenerationError) throw error;
    throw new StyleGenerationError(
      "Could not generate a style from those instructions.",
    );
  }
}
