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
  const [fileName, setFileName] = useState("");
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

  async function handleFileUpload(file: File | undefined) {
    if (!file) return;
    const allowed = /\.(md|txt|json|css)$/i.test(file.name);
    if (!allowed) {
      setMessage(t.unsupported);
      return;
    }

    const content = await file.text();
    const trimmed = content.trim().slice(0, 12000);
    if (!trimmed) {
      setMessage(t.emptyFile);
      return;
    }

    setFileName(file.name);
    setMessage("");
    startTransition(async () => {
      const result = await generateProjectStyleAction(projectId, {
        currentGadget: gadget,
        fileName: file.name,
        instructions: trimmed,
        source: "upload",
      });

      if ("error" in result) {
        setMessage(result.error ?? t.error);
        return;
      }

      onApply(result.gadget);
      setMessage(result.rationale ?? t.uploadApplied);
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
      <div className="mt-4 rounded-xl border border-emerald-200 bg-white/80 p-3">
        <label className="block text-sm font-medium text-emerald-950">
          {t.uploadTitle}
          <input
            accept=".md,.txt,.json,.css,text/markdown,text/plain,application/json,text/css"
            className="mt-2 block w-full text-sm text-emerald-900 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            disabled={isPending}
            type="file"
            onChange={(event) => void handleFileUpload(event.target.files?.[0])}
          />
        </label>
        <p className="mt-2 text-xs leading-5 text-emerald-800">
          {fileName ? `${t.loadedFile} ${fileName}` : t.uploadHint}
        </p>
      </div>
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
    button: "Apply style",
    description:
      "Describe the visual style you want. Atpio turns it into colors, textures, card style, spacing, and controls for the embedded form.",
    empty: "Describe the style you want first.",
    error: "Could not generate that style.",
    emptyFile: "That file is empty.",
    loadedFile: "Loaded file:",
    placeholder:
      "Examples: Y2K candy with chrome bubbles. Calm finance product with quiet grids. Botanical skincare style with soft green paper texture. Futuristic dashboard with circuit lines.",
    running: "Designing...",
    title: "Adjust visual style",
    unsupported: "Upload a .md, .txt, .json, or .css file.",
    uploadApplied: "Style applied from the uploaded file. Save changes to keep it.",
    uploadHint:
      "Upload brand guidelines, design tokens, CSS, or product style notes. Atpio reads the file and updates the preview.",
    uploadTitle: "Upload a design file",
  },
  zh: {
    applied: "样式已应用到预览。保存修改后会正式生效。",
    button: "应用样式",
    description:
      "描述你想要的视觉风格，Atpio 会把它转换成颜色、纹理、卡片质感、间距和控件样式。",
    empty: "请先描述你想要的风格。",
    error: "暂时无法生成这个样式。",
    emptyFile: "这个文件是空的。",
    loadedFile: "已读取文件：",
    placeholder:
      "例如：糖果感的千禧风，带金属气泡。安静的金融产品风格，带轻微网格。植物护肤品牌风格，柔和绿色和纸张纹理。未来感数据面板，带科技线条。",
    running: "设计中...",
    title: "调整视觉风格",
    unsupported: "请上传 .md、.txt、.json 或 .css 文件。",
    uploadApplied: "已根据上传文件应用样式。保存修改后会正式生效。",
    uploadHint:
      "上传品牌规范、设计变量、样式表或产品风格说明，Atpio 会读取内容并更新预览。",
    uploadTitle: "上传设计文件",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
