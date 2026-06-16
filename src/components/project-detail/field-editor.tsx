"use client";

import { FieldValidationPanel } from "@/components/project-detail/field-validation-panel";
import type { UiLanguage } from "@/lib/i18n";
import type { FieldType, FormField, FormPage } from "@/lib/types";

const fieldTypes: FieldType[] = [
  "short_text",
  "long_text",
  "single_select",
  "multi_select",
  "rating",
  "boolean",
];

const fieldTypeLabels = {
  en: {
    boolean: "Yes / no",
    long_text: "Long text",
    multi_select: "Multiple choice",
    rating: "Rating",
    short_text: "Short text",
    single_select: "Single choice",
  },
  zh: {
    boolean: "是或否",
    long_text: "长文本",
    multi_select: "多选",
    rating: "评分",
    short_text: "短文本",
    single_select: "单选",
  },
} satisfies Record<UiLanguage, Record<FieldType, string>>;

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
  uiLanguage: UiLanguage;
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
  uiLanguage,
}: FieldEditorProps) {
  const t = copy[uiLanguage];
  const isChoice =
    field.type === "single_select" || field.type === "multi_select";

  return (
    <div className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        <button
          className="h-9 rounded-md border border-stone-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          type="button"
        >
          {t.up}
        </button>
        <button
          className="h-9 rounded-md border border-stone-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          type="button"
        >
          {t.down}
        </button>
        {onDuplicate ? (
          <button
            className="h-9 rounded-md border border-stone-300 px-3 text-sm font-medium text-slate-700"
            onClick={onDuplicate}
            type="button"
          >
            {t.copy}
          </button>
        ) : null}
        <button
          className="h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700"
          onClick={onRemove}
          type="button"
        >
          {t.remove}
        </button>
      </div>
      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <label className="min-w-0 text-sm">
          <span className="font-medium text-slate-800">{t.fieldId}</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.id}
            onChange={(event) => onUpdate({ id: slugify(event.target.value) })}
          />
        </label>
        <label className="min-w-0 text-sm">
          <span className="font-medium text-slate-800">{t.label}</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.label}
            onChange={(event) => onUpdate({ label: event.target.value })}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.type}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.type}
            onChange={(event) =>
              onUpdate({ type: event.target.value as FieldType })
            }
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {fieldTypeLabels[uiLanguage][type]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-800">{t.page}</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
            value={field.pageId ?? ""}
            onChange={(event) =>
              onUpdate({ pageId: event.target.value || undefined })
            }
          >
            <option value="">{t.noPage}</option>
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
          {t.required}
        </label>
      </div>
      <label className="text-sm">
        <span className="font-medium text-slate-800">{t.placeholder}</span>
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
            {t.options}
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
        uiLanguage={uiLanguage}
        onUpdateValidation={onUpdateValidation}
      />
    </div>
  );
}

const copy = {
  en: {
    copy: "Copy",
    down: "Down",
    fieldId: "Field ID",
    label: "Label",
    noPage: "No page",
    options: "Options, separated by commas",
    page: "Page",
    placeholder: "Placeholder",
    remove: "Remove",
    required: "Required",
    type: "Type",
    up: "Up",
  },
  zh: {
    copy: "复制",
    down: "下移",
    fieldId: "字段编号",
    label: "问题文案",
    noPage: "不分页面",
    options: "选项，用逗号分隔",
    page: "页面",
    placeholder: "填写提示",
    remove: "删除",
    required: "必填",
    type: "题型",
    up: "上移",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
