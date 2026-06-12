"use client";

import type { UiLanguage } from "@/lib/i18n";

type AdvancedJsonEditorProps = {
  onApply: () => void;
  onChange: (value: string) => void;
  uiLanguage: UiLanguage;
  value: string;
};

export function AdvancedJsonEditor({
  onApply,
  onChange,
  uiLanguage,
  value,
}: AdvancedJsonEditorProps) {
  const t = copy[uiLanguage];

  return (
    <details className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-950">
        {t.title}
      </summary>
      <textarea
        className="mt-4 min-h-72 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none focus:border-emerald-600"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        className="mt-3 h-9 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium"
        onClick={onApply}
        type="button"
      >
        {t.apply}
      </button>
    </details>
  );
}

const copy = {
  en: {
    apply: "Apply JSON to builder",
    title: "Advanced JSON",
  },
  zh: {
    apply: "应用 JSON 到编辑器",
    title: "高级 JSON",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
