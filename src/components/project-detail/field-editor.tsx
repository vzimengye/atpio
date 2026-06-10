"use client";

import { FieldValidationPanel } from "@/components/project-detail/field-validation-panel";
import type { FieldType, FormField, FormPage } from "@/lib/types";

const fieldTypes: FieldType[] = [
  "short_text",
  "long_text",
  "single_select",
  "multi_select",
  "rating",
  "boolean",
];

type FieldEditorProps = {
  field: FormField;
  canMoveDown?: boolean;
  canMoveUp?: boolean;
  onDuplicate?: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<FormField>) => void;
  onUpdateValidation: (
    key: keyof NonNullable<FormField["validation"]>,
    value: number | undefined,
  ) => void;
  pages: FormPage[];
  slugify: (value: string) => string;
};

export function FieldEditor({
  field,
  canMoveDown = false,
  canMoveUp = false,
  onDuplicate,
  onMoveDown,
  onMoveUp,
  onRemove,
  onUpdate,
  onUpdateValidation,
  pages,
  slugify,
}: FieldEditorProps) {
  const isChoice =
    field.type === "single_select" || field.type === "multi_select";

  return (
    <div className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-[0.85fr_1.1fr_auto]">
        <label className="text-sm">
          <span className="font-medium text-slate-800">Field ID</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.id}
            onChange={(event) => onUpdate({ id: slugify(event.target.value) })}
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">Label</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.label}
            onChange={(event) => onUpdate({ label: event.target.value })}
          />
        </label>
        <div className="mt-7 flex flex-wrap gap-2">
          <button
            className="h-10 rounded-md border border-stone-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            type="button"
          >
            Up
          </button>
          <button
            className="h-10 rounded-md border border-stone-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            type="button"
          >
            Down
          </button>
          {onDuplicate ? (
            <button
              className="h-10 rounded-md border border-stone-300 px-3 text-sm font-medium text-slate-700"
              onClick={onDuplicate}
              type="button"
            >
              Copy
            </button>
          ) : null}
          <button
            className="h-10 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700"
            onClick={onRemove}
            type="button"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-medium text-slate-800">Type</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.type}
            onChange={(event) =>
              onUpdate({ type: event.target.value as FieldType })
            }
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">Page</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.pageId ?? ""}
            onChange={(event) =>
              onUpdate({ pageId: event.target.value || undefined })
            }
          >
            <option value="">No page</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-800">
          <input
            checked={Boolean(field.required)}
            onChange={(event) => onUpdate({ required: event.target.checked })}
            type="checkbox"
          />
          Required
        </label>
      </div>
      <label className="text-sm">
        <span className="font-medium text-slate-800">Placeholder</span>
        <input
          className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
          value={field.placeholder ?? ""}
          onChange={(event) =>
            onUpdate({ placeholder: event.target.value || undefined })
          }
        />
      </label>
      {isChoice ? (
        <label className="text-sm">
          <span className="font-medium text-slate-800">
            Options, comma separated
          </span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={(field.options ?? []).join(", ")}
            onChange={(event) =>
              onUpdate({
                options: event.target.value
                  .split(",")
                  .map((option) => option.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
      ) : null}
      <FieldValidationPanel
        field={field}
        onUpdateValidation={onUpdateValidation}
      />
    </div>
  );
}
