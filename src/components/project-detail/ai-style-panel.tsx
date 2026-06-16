"use client";

import { useState, useTransition } from "react";
import { generateProjectStyleAction } from "@/app/projects/actions";
import type { UiLanguage } from "@/lib/i18n";
import type { GadgetSettings } from "@/lib/types";

type AiStylePanelProps = {
  gadget: GadgetSettings;
  projectId: string;
  uiLanguage: UiLanguage;
  onApply: (gadget: GadgetSettings) => void;
};

export function AiStylePanel({
  gadget,
  projectId,
  uiLanguage,
  onApply,
}: AiStylePanelProps) {
  const t = copy[uiLanguage];
  const [instructions, setInstructions] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function generateStyle() {
    const trimmed = instructions.trim();
    if (!trimmed) {
      setMessage(t.empty);
      return;
    }

    setMessage("");
    startTransition(async () => {
      const result = await generateProjectStyleAction(projectId, {
        currentGadget: gadget,
        instructions: trimmed,
        source: "prompt",
      });

      if ("error" in result) {
        setMessage(result.error ?? t.error);
        return;
      }

      onApply(result.gadget);
      setMessage(result.rationale ?? t.applied);
    });
  }

  return (
    <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-emerald-950">
            {t.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            {t.description}
          </p>
        </div>
        <button
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-medium text-white disabled:opacity-50"
          disabled={isPending}
          onClick={generateStyle}
          type="button"
        >
          {isPending ? t.running : t.button}
        </button>
      </div>
      <textarea
        className="mt-3 min-h-24 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        placeholder={t.placeholder}
        value={instructions}
        onChange={(event) => setInstructions(event.target.value)}
      />
      {message ? (
        <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
    </div>
  );
}

const copy = {
  en: {
    applied: "Style applied to the preview. Save changes to keep it.",
    button: "Apply AI style",
    description:
      "Describe the look you want. Atpio converts it into safe theme tokens for the HTML feedback experience.",
    empty: "Describe the style you want first.",
    error: "Could not generate that style.",
    placeholder:
      "Example: Make it match a calm enterprise analytics product: compact spacing, soft blue accents, white cards, subtle borders, no heavy shadows.",
    running: "Designing...",
    title: "Customize style with AI",
  },
  zh: {
    applied: "样式已应用到预览。点击保存修改后会正式生效。",
    button: "应用 AI 样式",
    description:
      "描述你想要的视觉风格，Atpio 会把它转换成安全的 HTML feedback theme tokens。",
    empty: "请先描述你想要的风格。",
    error: "无法生成这个样式。",
    placeholder:
      "例如：让它像一个干净的 B2B 数据分析产品，紧凑间距、柔和蓝色强调、白色卡片、细边框、不要重阴影。",
    running: "设计中...",
    title: "用 AI 调整样式",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
