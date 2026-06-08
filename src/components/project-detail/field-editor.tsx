"use client";

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
  onRemove,
  onUpdate,
  onUpdateValidation,
  pages,
  slugify,
}: FieldEditorProps) {
  const isChoice =
    field.type === "single_select" || field.type === "multi_select";
  const isText = field.type === "short_text" || field.type === "long_text";
  const isRating = field.type === "rating";

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
        <button
          className="mt-7 h-10 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
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
      <div className="grid gap-3 rounded-lg bg-stone-50 p-3 sm:grid-cols-4">
        <p className="text-sm font-medium text-slate-800 sm:pt-2">
          Validation
        </p>
        {isText ? (
          <>
            <ValidationInput
              label="Min length"
              value={field.validation?.minLength}
              onChange={(value) => onUpdateValidation("minLength", value)}
            />
            <ValidationInput
              label="Max length"
              value={field.validation?.maxLength}
              onChange={(value) => onUpdateValidation("maxLength", value)}
            />
          </>
        ) : null}
        {isRating ? (
          <>
            <ValidationInput
              label="Min"
              value={field.validation?.min}
              onChange={(value) => onUpdateValidation("min", value)}
            />
            <ValidationInput
              label="Max"
              value={field.validation?.max}
              onChange={(value) => onUpdateValidation("max", value)}
            />
          </>
        ) : null}
        {!isText && !isRating ? (
          <p className="text-sm text-slate-500 sm:col-span-3">
            This field type does not need numeric validation.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function numberOrUndefined(value: string) {
  return value === "" ? undefined : Number(value);
}

function ValidationInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number | undefined) => void;
  value?: number;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="mt-1 h-9 w-full rounded-md border border-stone-300 px-3"
        min={0}
        onChange={(event) => onChange(numberOrUndefined(event.target.value))}
        type="number"
        value={value ?? ""}
      />
    </label>
  );
}
