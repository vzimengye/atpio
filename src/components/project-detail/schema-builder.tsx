"use client";

import { AdvancedJsonEditor } from "@/components/project-detail/advanced-json-editor";
import { FieldsEditor } from "@/components/project-detail/fields-editor";
import { PagesEditor } from "@/components/project-detail/pages-editor";
import type { UiLanguage } from "@/lib/i18n";
import type { FormField, FormPage, ProjectSchema } from "@/lib/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type SchemaBuilderProps = {
  schema: ProjectSchema;
  schemaText: string;
  status: SaveStatus;
  slugify: (value: string) => string;
  uiLanguage: UiLanguage;
  onAddField: () => void;
  onAddPage: () => void;
  onApplySchemaText: () => void;
  onDuplicateField?: (fieldId: string) => void;
  onMoveField?: (fieldId: string, direction: "up" | "down") => void;
  onRemoveField: (fieldId: string) => void;
  onRemovePage: (pageId: string) => void;
  onSave: () => void;
  onSchemaTextChange: (value: string) => void;
  onUpdateField: (fieldId: string, patch: Partial<FormField>) => void;
  onUpdatePage: (pageId: string, patch: Partial<FormPage>) => void;
  onUpdateSchema: (updater: (schema: ProjectSchema) => ProjectSchema) => void;
  onUpdateValidation: (
    fieldId: string,
    key: keyof NonNullable<FormField["validation"]>,
    value: number | undefined,
  ) => void;
};

export function SchemaBuilder({
  schema,
  schemaText,
  status,
  slugify,
  uiLanguage,
  onAddField,
  onAddPage,
  onApplySchemaText,
  onDuplicateField,
  onMoveField,
  onRemoveField,
  onRemovePage,
  onSave,
  onSchemaTextChange,
  onUpdateField,
  onUpdatePage,
  onUpdateSchema,
  onUpdateValidation,
}: SchemaBuilderProps) {
  const t = copy[uiLanguage];

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">{t.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold">
            {t.title}
          </h1>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
          disabled={status === "saving"}
          onClick={onSave}
        >
          {status === "saving" ? t.saving : t.save}
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.formTitle}</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={schema.title}
            onChange={(event) =>
              onUpdateSchema((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.description}</span>
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2"
            value={schema.description}
            onChange={(event) =>
              onUpdateSchema((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <PagesEditor
        pages={schema.pages ?? []}
        slugify={slugify}
        uiLanguage={uiLanguage}
        onAddPage={onAddPage}
        onRemovePage={onRemovePage}
        onUpdatePage={onUpdatePage}
      />

      <FieldsEditor
        fields={schema.fields}
        pages={schema.pages ?? []}
        slugify={slugify}
        uiLanguage={uiLanguage}
        onAddField={onAddField}
        onDuplicateField={onDuplicateField}
        onMoveField={onMoveField}
        onRemoveField={onRemoveField}
        onUpdateField={onUpdateField}
        onUpdateValidation={onUpdateValidation}
      />

      <AdvancedJsonEditor
        uiLanguage={uiLanguage}
        value={schemaText}
        onApply={onApplySchemaText}
        onChange={onSchemaTextChange}
      />
      {status === "saved" ? (
        <p className="mt-3 text-sm text-emerald-700">{t.saved}</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-3 text-sm text-red-700">
          {t.error}
        </p>
      ) : null}
    </section>
  );
}

const copy = {
  en: {
    description: "Description",
    error: "Could not save. Check that the form structure is valid.",
    eyebrow: "Form editor",
    formTitle: "Form title",
    save: "Save changes",
    saved: "Saved.",
    saving: "Saving...",
    title: "Build the form visually",
  },
  zh: {
    description: "说明",
    error: "无法保存。请检查问卷结构是否有效。",
    eyebrow: "问卷编辑器",
    formTitle: "表单标题",
    save: "保存修改",
    saved: "已保存。",
    saving: "保存中...",
    title: "可视化编辑表单",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
