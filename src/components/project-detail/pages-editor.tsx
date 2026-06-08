"use client";

import type { FormPage } from "@/lib/types";

type PagesEditorProps = {
  pages: FormPage[];
  slugify: (value: string) => string;
  onAddPage: () => void;
  onRemovePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, patch: Partial<FormPage>) => void;
};

export function PagesEditor({
  pages,
  slugify,
  onAddPage,
  onRemovePage,
  onUpdatePage,
}: PagesEditorProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-950">Pages</h2>
        <button
          className="h-9 rounded-full border border-stone-300 px-3 text-sm font-medium"
          onClick={onAddPage}
          type="button"
        >
          Add page
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
                <span className="font-medium text-slate-800">Page ID</span>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                  value={page.id}
                  onChange={(event) =>
                    onUpdatePage(page.id, { id: slugify(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm">
                <span className="font-medium text-slate-800">Title</span>
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
                Remove
              </button>
            </div>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Description</span>
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
            No pages configured. Fields will render as one continuous form.
          </p>
        ) : null}
      </div>
    </div>
  );
}
