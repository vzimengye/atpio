"use client";

import { FieldEditor } from "@/components/project-detail/field-editor";
import type { UiLanguage } from "@/lib/i18n";
import type { FormField, FormPage } from "@/lib/types";

type FieldsEditorProps = {
  fields: FormField[];
  pages: FormPage[];
  slugify: (value: string) => string;
  uiLanguage: UiLanguage;
  onAddField: () => void;
  onDuplicateField?: (fieldId: string) => void;
  onMoveField?: (fieldId: string, direction: "up" | "down") => void;
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
  uiLanguage,
  onAddField,
  onDuplicateField,
  onMoveField,
  onRemoveField,
  onUpdateField,
  onUpdateValidation,
}: FieldsEditorProps) {
  const t = copy[uiLanguage];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-950">{t.fields}</h2>
        <button
          className="h-9 rounded-full border border-stone-300 px-3 text-sm font-medium"
          onClick={onAddField}
          type="button"
        >
          {t.addField}
        </button>
      </div>
      <div className="mt-3 grid gap-4">
        {fields.map((field, index) => (
          <FieldEditor
            canMoveDown={Boolean(onMoveField) && index < fields.length - 1}
            canMoveUp={Boolean(onMoveField) && index > 0}
            field={field}
            key={field.id}
            pages={pages}
            slugify={slugify}
            uiLanguage={uiLanguage}
            onDuplicate={
              onDuplicateField ? () => onDuplicateField(field.id) : undefined
            }
            onMoveDown={
              onMoveField ? () => onMoveField(field.id, "down") : undefined
            }
            onMoveUp={
              onMoveField ? () => onMoveField(field.id, "up") : undefined
            }
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

const copy = {
  en: {
    addField: "Add field",
    fields: "Fields",
  },
  zh: {
    addField: "添加问题",
    fields: "问题",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
