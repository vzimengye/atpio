"use client";

import { FieldEditor } from "@/components/project-detail/field-editor";
import type { FormField, FormPage } from "@/lib/types";

type FieldsEditorProps = {
  fields: FormField[];
  pages: FormPage[];
  slugify: (value: string) => string;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  onUpdateField: (fieldId: string, patch: Partial<FormField>) => void;
  onUpdateValidation: (
    fieldId: string,
    key: keyof NonNullable<FormField["validation"]>,
    value: number | undefined,
  ) => void;
};

export function FieldsEditor({
  fields,
  pages,
  slugify,
  onAddField,
  onRemoveField,
  onUpdateField,
  onUpdateValidation,
}: FieldsEditorProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-950">Fields</h2>
        <button
          className="h-9 rounded-full border border-stone-300 px-3 text-sm font-medium"
          onClick={onAddField}
          type="button"
        >
          Add field
        </button>
      </div>
      <div className="mt-3 grid gap-4">
        {fields.map((field) => (
          <FieldEditor
            field={field}
            key={field.id}
            pages={pages}
            slugify={slugify}
            onRemove={() => onRemoveField(field.id)}
            onUpdate={(patch) => onUpdateField(field.id, patch)}
            onUpdateValidation={(key, value) =>
              onUpdateValidation(field.id, key, value)
            }
          />
        ))}
      </div>
    </div>
  );
}
