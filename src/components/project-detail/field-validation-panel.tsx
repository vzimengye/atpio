"use client";

import type { FormField } from "@/lib/types";

type FieldValidationPanelProps = {
  field: FormField;
  onUpdateValidation: (
    key: keyof NonNullable<FormField["validation"]>,
    value: number | undefined,
  ) => void;
};

export function FieldValidationPanel({
  field,
  onUpdateValidation,
}: FieldValidationPanelProps) {
  const isText = field.type === "short_text" || field.type === "long_text";
  const isRating = field.type === "rating";

  return (
    <div className="grid gap-3 rounded-lg bg-stone-50 p-3 sm:grid-cols-4">
      <p className="text-sm font-medium text-slate-800 sm:pt-2">Validation</p>
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
