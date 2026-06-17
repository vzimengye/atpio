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
    return createFallbackStyle({
      currentGadget,
      fileName,
      instructions,
      source,
    });
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
    "backgroundPattern": "none | dots | grid | waves | botanical | sparkles | circuit | paper | bubbles",
    "decorativeIntensity": "none | subtle | medium | bold",
    "surfaceStyle": "solid | glass | paper | neon | editorial",
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
- Make the visual style more expressive when the user asks for a specific direction such as Y2K, tech, botanical, beauty, finance, climate, editorial, playful, or luxury.
- Use backgroundPattern, decorativeIntensity, and surfaceStyle to create an elevated website-like visual surface with vector motifs, texture, and layered backgrounds without changing the form flow.
- For rainy, water, soft lifestyle, or fresh styles, prefer bubbles or waves with glass. For botanical or skincare, prefer botanical with paper. For technology, prefer circuit with neon. For Y2K or beauty, prefer sparkles with glass.
- Match buttonLabel and successMessage to the likely language of the guidance.
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
    return createFallbackStyle({
      currentGadget,
      fileName,
      instructions,
      source,
    });
  }
}

function createFallbackStyle({
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
  const isChinese = /[\u3400-\u9fff]/.test(instructions);
  const base = withGadgetDefaults(currentGadget);
  const style: Partial<GadgetSettings> = {
    backgroundPattern: "dots",
    decorativeIntensity: "subtle",
    surfaceStyle: "glass",
    theme: "light",
  };

  if (/(rain|rainy|雨|雨滴|drizzle|water|清新|fresh)/i.test(instructions)) {
    Object.assign(style, {
      accentColor: "#38bdf8",
      backgroundColor: "#f0f9ff",
      backgroundPattern: "bubbles",
      borderColor: "#bae6fd",
      brandColor: "#075985",
      decorativeIntensity: "medium",
      surfaceStyle: "glass",
      textColor: "#0f172a",
    });
  } else if (/(y2k|candy|chrome|糖果|千禧|金属)/i.test(instructions)) {
    Object.assign(style, {
      accentColor: "#f472b6",
      backgroundColor: "#fff1f8",
      backgroundPattern: "sparkles",
      borderColor: "#f9a8d4",
      brandColor: "#831843",
      decorativeIntensity: "bold",
      surfaceStyle: "glass",
      textColor: "#1f1020",
    });
  } else if (/(tech|future|circuit|科技|未来|数据|dashboard)/i.test(instructions)) {
    Object.assign(style, {
      accentColor: "#22d3ee",
      backgroundColor: "#020617",
      backgroundPattern: "circuit",
      borderColor: "#155e75",
      brandColor: "#e0f2fe",
      decorativeIntensity: "medium",
      surfaceStyle: "neon",
      textColor: "#f8fafc",
      theme: "dark",
    });
  } else if (/(plant|botanical|green|植物|自然|环保|护肤)/i.test(instructions)) {
    Object.assign(style, {
      accentColor: "#22c55e",
      backgroundColor: "#f0fdf4",
      backgroundPattern: "botanical",
      borderColor: "#bbf7d0",
      brandColor: "#14532d",
      decorativeIntensity: "medium",
      surfaceStyle: "paper",
      textColor: "#052e16",
    });
  } else if (/(finance|bank|金融|银行|专业|enterprise)/i.test(instructions)) {
    Object.assign(style, {
      accentColor: "#2563eb",
      backgroundColor: "#f8fafc",
      backgroundPattern: "grid",
      borderColor: "#cbd5e1",
      brandColor: "#0f172a",
      decorativeIntensity: "subtle",
      surfaceStyle: "solid",
      textColor: "#0f172a",
    });
  }

  return {
    gadget: {
      ...base,
      ...style,
      buttonLabel: isChinese ? "提交反馈" : base.buttonLabel,
      successMessage: isChinese ? "感谢，反馈已保存。" : base.successMessage,
      styleReferenceFileName: fileName ?? base.styleReferenceFileName,
      styleSource: source,
    } satisfies GadgetSettings,
    rationale: isChinese
      ? "已根据描述生成可用的视觉风格。"
      : "A usable visual style was generated from the description.",
  };
}
