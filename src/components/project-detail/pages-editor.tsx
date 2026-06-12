"use client";

import type { UiLanguage } from "@/lib/i18n";
import type { FormPage } from "@/lib/types";

type PagesEditorProps = {
  pages: FormPage[];
  slugify: (value: string) => string;
  uiLanguage: UiLanguage;
  onAddPage: () => void;
  onRemovePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, patch: Partial<FormPage>) => void;
};

export function PagesEditor({
  pages,
  slugify,
  uiLanguage,
  onAddPage,
  onRemovePage,
  onUpdatePage,
}: PagesEditorProps) {
  const t = copy[uiLanguage];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-950">{t.pages}</h2>
        <button
          className="h-9 rounded-full border border-stone-300 px-3 text-sm font-medium"
          onClick={onAddPage}
          type="button"
        >
          {t.addPage}
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {pages.map((page) => (
          <div
            className="grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4"
            key={page.id}
          >
            <div className="grid gap-3 sm:grid-cols-[0.7fr_1fr_auto]">
              <label className="text-sm">
                <span className="font-medium text-slate-800">{t.pageId}</span>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                  value={page.id}
                  onChange={(event) =>
                    onUpdatePage(page.id, { id: slugify(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="font-medium text-slate-800">{t.title}</span>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                  value={page.title}
                  onChange={(event) =>
                    onUpdatePage(page.id, { title: event.target.value })
                  }
                />
              </label>
              <button
                className="mt-7 h-10 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700"
                onClick={() => onRemovePage(page.id)}
                type="button"
              >
                {t.remove}
              </button>
            </div>
            <label className="text-sm">
              <span className="font-medium text-slate-800">{t.description}</span>
              <input
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                value={page.description ?? ""}
                onChange={(event) =>
                  onUpdatePage(page.id, { description: event.target.value })
                }
              />
            </label>
          </div>
        ))}
        {pages.length === 0 ? (
          <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-slate-600">
            {t.noPages}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const copy = {
  en: {
    addPage: "Add page",
    description: "Description",
    noPages: "No pages configured. Fields will render as one continuous form.",
    pageId: "Page ID",
    pages: "Pages",
    remove: "Remove",
    title: "Title",
  },
  zh: {
    addPage: "添加页面",
    description: "描述",
    noPages: "还没有配置页面。所有问题会作为一个连续表单展示。",
    pageId: "页面 ID",
    pages: "页面",
    remove: "删除",
    title: "标题",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
