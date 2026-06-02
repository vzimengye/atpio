"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ProjectSchema } from "@/lib/types";

type DynamicFormProps = {
  projectId: string;
  schema: ProjectSchema;
  compact?: boolean;
};

type FormState = Record<string, string | string[] | boolean>;

export function DynamicForm({ projectId, schema, compact }: DynamicFormProps) {
  const initialState = useMemo(
    () =>
      Object.fromEntries(
        schema.fields.map((field) => [
          field.id,
          field.type === "multi_select" ? [] : "",
        ]),
      ) as FormState,
    [schema.fields],
  );
  const [answers, setAnswers] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function updateAnswer(fieldId: string, value: string | string[] | boolean) {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  function toggleMultiSelect(fieldId: string, option: string) {
    const current = answers[fieldId];
    const values = Array.isArray(current) ? current : [];
    updateAnswer(
      fieldId,
      values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(`/api/projects/${projectId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="text-lg font-semibold text-emerald-950">
          Thanks for the feedback.
        </h2>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          This response is saved and ready for the project dashboard.
        </p>
      </div>
    );
  }

  return (
    <form
      className={compact ? "space-y-4" : "space-y-5"}
      onSubmit={handleSubmit}
    >
      <div>
        <h1 className={compact ? "text-xl font-semibold" : "text-2xl font-semibold"}>
          {schema.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {schema.description}
        </p>
      </div>

      {schema.fields.map((field) => (
        <label key={field.id} className="block">
          <span className="text-sm font-medium text-slate-900">
            {field.label}
            {field.required ? " *" : ""}
          </span>

          {field.type === "short_text" ? (
            <input
              className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600"
              required={field.required}
              value={String(answers[field.id] ?? "")}
              onChange={(event) => updateAnswer(field.id, event.target.value)}
            />
          ) : null}

          {field.type === "long_text" ? (
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              required={field.required}
              value={String(answers[field.id] ?? "")}
              onChange={(event) => updateAnswer(field.id, event.target.value)}
            />
          ) : null}

          {field.type === "single_select" ? (
            <select
              className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600"
              required={field.required}
              value={String(answers[field.id] ?? "")}
              onChange={(event) => updateAnswer(field.id, event.target.value)}
            >
              <option value="">Select one</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}

          {field.type === "multi_select" ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {field.options?.map((option) => {
                const value = answers[field.id];
                const selected = Array.isArray(value) && value.includes(option);

                return (
                  <button
                    key={option}
                    className={
                      selected
                        ? "rounded-md border border-emerald-600 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                        : "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
                    }
                    type="button"
                    onClick={() => toggleMultiSelect(field.id, option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : null}

          {field.type === "rating" ? (
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className={
                    String(answers[field.id]) === String(rating)
                      ? "h-10 w-10 rounded-md bg-slate-950 text-sm font-medium text-white"
                      : "h-10 w-10 rounded-md border border-slate-300 text-sm font-medium text-slate-700"
                  }
                  type="button"
                  onClick={() => updateAnswer(field.id, String(rating))}
                >
                  {rating}
                </button>
              ))}
            </div>
          ) : null}

          {field.type === "boolean" ? (
            <input
              className="mt-3 h-4 w-4 rounded border-slate-300"
              type="checkbox"
              checked={Boolean(answers[field.id])}
              onChange={(event) => updateAnswer(field.id, event.target.checked)}
            />
          ) : null}
        </label>
      ))}

      <button
        className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
        type="submit"
      >
        Submit feedback
      </button>
    </form>
  );
}
