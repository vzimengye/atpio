"use client";

type AdvancedJsonEditorProps = {
  onApply: () => void;
  onChange: (value: string) => void;
  value: string;
};

export function AdvancedJsonEditor({
  onApply,
  onChange,
  value,
}: AdvancedJsonEditorProps) {
  return (
    <details className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-950">
        Advanced JSON
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
        Apply JSON to builder
      </button>
    </details>
  );
}
