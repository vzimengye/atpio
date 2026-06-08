"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publicAppUrl } from "@/lib/public-url";
import type {
  DataProject,
  FieldType,
  FormField,
  FormPage,
  GadgetSettings,
  ProjectResponse,
  ProjectSchema,
} from "@/lib/types";

type ProjectDetailEditorProps = {
  initialProject: DataProject;
  responses: ProjectResponse[];
};

const fieldTypes: FieldType[] = [
  "short_text",
  "long_text",
  "single_select",
  "multi_select",
  "rating",
  "boolean",
];

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field"
  );
}

function numberOrUndefined(value: string) {
  return value === "" ? undefined : Number(value);
}

export function ProjectDetailEditor({
  initialProject,
  responses,
}: ProjectDetailEditorProps) {
  const [project, setProject] = useState(initialProject);
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(initialProject.schema, null, 2),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const embedCode = useMemo(
    () =>
      `<script src="${publicAppUrl}/gadget.js" data-project-id="${project.id}" data-atpio-position="${project.gadget.position}" data-atpio-theme="${project.gadget.theme}" data-atpio-label="${project.gadget.buttonLabel}" data-atpio-brand-color="${project.gadget.brandColor}" data-atpio-accent-color="${project.gadget.accentColor}" data-atpio-button-shape="${project.gadget.buttonShape}" data-atpio-font-family="${project.gadget.fontFamily}"></script>`,
    [
      project.gadget.accentColor,
      project.gadget.brandColor,
      project.gadget.buttonLabel,
      project.gadget.buttonShape,
      project.gadget.fontFamily,
      project.gadget.position,
      project.gadget.theme,
      project.id,
    ],
  );

  function updateSchema(updater: (schema: ProjectSchema) => ProjectSchema) {
    setStatus("idle");
    setProject((current) => {
      const nextSchema = updater(current.schema);
      setSchemaText(JSON.stringify(nextSchema, null, 2));
      return { ...current, schema: nextSchema };
    });
  }

  function updatePage(pageId: string, patch: Partial<FormPage>) {
    updateSchema((schema) => ({
      ...schema,
      pages: (schema.pages ?? []).map((page) =>
        page.id === pageId ? { ...page, ...patch } : page,
      ),
      fields:
        patch.id && patch.id !== pageId
          ? schema.fields.map((field) =>
              field.pageId === pageId ? { ...field, pageId: patch.id } : field,
            )
          : schema.fields,
    }));
  }

  function addPage() {
    updateSchema((schema) => {
      const nextIndex = (schema.pages?.length ?? 0) + 1;
      return {
        ...schema,
        pages: [
          ...(schema.pages ?? []),
          {
            id: `page_${nextIndex}`,
            title: `Page ${nextIndex}`,
            description: "",
          },
        ],
      };
    });
  }

  function removePage(pageId: string) {
    updateSchema((schema) => ({
      ...schema,
      pages: schema.pages?.filter((page) => page.id !== pageId),
      fields: schema.fields.map((field) =>
        field.pageId === pageId ? { ...field, pageId: undefined } : field,
      ),
    }));
  }

  function updateField(fieldId: string, patch: Partial<FormField>) {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    }));
  }

  function updateValidation(
    fieldId: string,
    key: keyof NonNullable<FormField["validation"]>,
    value: number | undefined,
  ) {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.map((field) => {
        if (field.id !== fieldId) return field;
        const validation = { ...(field.validation ?? {}), [key]: value };
        Object.keys(validation).forEach((validationKey) => {
          if (
            validation[validationKey as keyof typeof validation] === undefined ||
            Number.isNaN(validation[validationKey as keyof typeof validation])
          ) {
            delete validation[validationKey as keyof typeof validation];
          }
        });
        return {
          ...field,
          validation:
            Object.keys(validation).length > 0 ? validation : undefined,
        };
      }),
    }));
  }

  function addField() {
    updateSchema((schema) => {
      const nextIndex = schema.fields.length + 1;
      const pageId = schema.pages?.[0]?.id;
      return {
        ...schema,
        fields: [
          ...schema.fields,
          {
            id: `field_${nextIndex}`,
            type: "short_text",
            label: `Question ${nextIndex}`,
            required: false,
            pageId,
          },
        ],
      };
    });
  }

  function removeField(fieldId: string) {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.filter((field) => field.id !== fieldId),
    }));
  }

  function applySchemaText() {
    try {
      const parsedSchema = JSON.parse(schemaText) as ProjectSchema;
      setProject((current) => ({ ...current, schema: parsedSchema }));
      setSchemaText(JSON.stringify(parsedSchema, null, 2));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function updateGadget<K extends keyof GadgetSettings>(
    key: K,
    value: GadgetSettings[K],
  ) {
    setProject((current) => ({
      ...current,
      gadget: { ...current.gadget, [key]: value },
    }));
    setStatus("idle");
  }

  async function saveChanges() {
    setStatus("saving");
    try {
      const parsedSchema = JSON.parse(schemaText);
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name,
          brief: project.brief,
          schema: parsedSchema,
          gadget: project.gadget,
        }),
      });

      if (!response.ok) throw new Error("Save failed.");

      const payload = await response.json();
      setProject(payload.project);
      setSchemaText(JSON.stringify(payload.project.schema, null, 2));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 xl:grid-cols-[0.95fr_1.05fr] xl:px-8">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-emerald-700">Project detail</p>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700"
              href="/projects"
            >
              All projects
            </Link>
            <Link
              className="rounded-full bg-slate-950 px-3 py-1.5 text-sm font-medium text-white"
              href="/projects/new"
            >
              Generate new form
            </Link>
          </div>
        </div>
        <input
          className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-2xl font-semibold outline-none focus:border-emerald-600"
          value={project.name}
          onChange={(event) =>
            setProject((current) => ({ ...current, name: event.target.value }))
          }
        />
        <textarea
          className="mt-4 min-h-28 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm leading-6 outline-none focus:border-emerald-600"
          value={project.brief}
          onChange={(event) =>
            setProject((current) => ({ ...current, brief: event.target.value }))
          }
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Responses" value={responses.length} />
          <Metric label="Fields" value={project.schema.fields.length} />
          <Metric label="Pages" value={project.schema.pages?.length ?? 1} />
        </div>

        <div className="mt-6 rounded-xl bg-stone-50 p-4">
          <h2 className="text-sm font-semibold text-slate-950">Gadget settings</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium text-slate-800">Position</span>
              <select
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                value={project.gadget.position}
                onChange={(event) =>
                  updateGadget(
                    "position",
                    event.target.value as GadgetSettings["position"],
                  )
                }
              >
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
                <option value="top-right">Top right</option>
                <option value="top-left">Top left</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Theme</span>
              <select
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                value={project.gadget.theme}
                onChange={(event) =>
                  updateGadget("theme", event.target.value as GadgetSettings["theme"])
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Button label</span>
              <input
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                value={project.gadget.buttonLabel}
                onChange={(event) => updateGadget("buttonLabel", event.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Success message</span>
              <input
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                value={project.gadget.successMessage}
                onChange={(event) =>
                  updateGadget("successMessage", event.target.value)
                }
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Brand color</span>
              <input
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-2"
                type="color"
                value={project.gadget.brandColor}
                onChange={(event) => updateGadget("brandColor", event.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Accent color</span>
              <input
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-2"
                type="color"
                value={project.gadget.accentColor}
                onChange={(event) => updateGadget("accentColor", event.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Button shape</span>
              <select
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                value={project.gadget.buttonShape}
                onChange={(event) =>
                  updateGadget(
                    "buttonShape",
                    event.target.value as GadgetSettings["buttonShape"],
                  )
                }
              >
                <option value="pill">Pill</option>
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Font family</span>
              <input
                className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                value={project.gadget.fontFamily}
                onChange={(event) => updateGadget("fontFamily", event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-950 p-4 text-slate-50">
          <p className="text-sm font-medium">Embed code</p>
          <pre className="mt-3 whitespace-pre-wrap break-all text-xs leading-6">
            {embedCode}
          </pre>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Schema editor</p>
            <h1 className="mt-1 text-2xl font-semibold">Build the form visually</h1>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
            disabled={status === "saving"}
            onClick={saveChanges}
          >
            Save changes
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="text-sm">
            <span className="font-medium text-slate-800">Form title</span>
            <input
              className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
              value={project.schema.title}
              onChange={(event) =>
                updateSchema((schema) => ({
                  ...schema,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-800">Description</span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2"
              value={project.schema.description}
              onChange={(event) =>
                updateSchema((schema) => ({
                  ...schema,
                  description: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-950">Pages</h2>
            <button
              className="h-9 rounded-full border border-stone-300 px-3 text-sm font-medium"
              onClick={addPage}
              type="button"
            >
              Add page
            </button>
          </div>
          <div className="mt-3 grid gap-3">
            {(project.schema.pages ?? []).map((page) => (
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
                        updatePage(page.id, { id: slugify(event.target.value) })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    <span className="font-medium text-slate-800">Title</span>
                    <input
                      className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                      value={page.title}
                      onChange={(event) =>
                        updatePage(page.id, { title: event.target.value })
                      }
                    />
                  </label>
                  <button
                    className="mt-7 h-10 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700"
                    onClick={() => removePage(page.id)}
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
                      updatePage(page.id, { description: event.target.value })
                    }
                  />
                </label>
              </div>
            ))}
            {(project.schema.pages?.length ?? 0) === 0 ? (
              <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-slate-600">
                No pages configured. Fields will render as one continuous form.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-950">Fields</h2>
            <button
              className="h-9 rounded-full border border-stone-300 px-3 text-sm font-medium"
              onClick={addField}
              type="button"
            >
              Add field
            </button>
          </div>
          <div className="mt-3 grid gap-4">
            {project.schema.fields.map((field) => {
              const isChoice =
                field.type === "single_select" || field.type === "multi_select";
              const isText =
                field.type === "short_text" || field.type === "long_text";
              const isRating = field.type === "rating";

              return (
                <div
                  className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4"
                  key={field.id}
                >
                  <div className="grid gap-3 sm:grid-cols-[0.85fr_1.1fr_auto]">
                    <label className="text-sm">
                      <span className="font-medium text-slate-800">Field ID</span>
                      <input
                        className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                        value={field.id}
                        onChange={(event) =>
                          updateField(field.id, {
                            id: slugify(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label className="text-sm">
                      <span className="font-medium text-slate-800">Label</span>
                      <input
                        className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3"
                        value={field.label}
                        onChange={(event) =>
                          updateField(field.id, { label: event.target.value })
                        }
                      />
                    </label>
                    <button
                      className="mt-7 h-10 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700"
                      onClick={() => removeField(field.id)}
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
                          updateField(field.id, {
                            type: event.target.value as FieldType,
                          })
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
                          updateField(field.id, {
                            pageId: event.target.value || undefined,
                          })
                        }
                      >
                        <option value="">No page</option>
                        {(project.schema.pages ?? []).map((page) => (
                          <option key={page.id} value={page.id}>
                            {page.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-800">
                      <input
                        checked={Boolean(field.required)}
                        onChange={(event) =>
                          updateField(field.id, {
                            required: event.target.checked,
                          })
                        }
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
                        updateField(field.id, {
                          placeholder: event.target.value || undefined,
                        })
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
                          updateField(field.id, {
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
                          onChange={(value) =>
                            updateValidation(field.id, "minLength", value)
                          }
                        />
                        <ValidationInput
                          label="Max length"
                          value={field.validation?.maxLength}
                          onChange={(value) =>
                            updateValidation(field.id, "maxLength", value)
                          }
                        />
                      </>
                    ) : null}
                    {isRating ? (
                      <>
                        <ValidationInput
                          label="Min"
                          value={field.validation?.min}
                          onChange={(value) =>
                            updateValidation(field.id, "min", value)
                          }
                        />
                        <ValidationInput
                          label="Max"
                          value={field.validation?.max}
                          onChange={(value) =>
                            updateValidation(field.id, "max", value)
                          }
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
            })}
          </div>
        </div>

        <details className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-950">
            Advanced JSON
          </summary>
          <textarea
            className="mt-4 min-h-72 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-xs leading-6 outline-none focus:border-emerald-600"
            spellCheck={false}
            value={schemaText}
            onChange={(event) => {
              setSchemaText(event.target.value);
              setStatus("idle");
            }}
          />
          <button
            className="mt-3 h-9 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium"
            onClick={applySchemaText}
            type="button"
          >
            Apply JSON to builder
          </button>
        </details>
        {status === "saved" ? (
          <p className="mt-3 text-sm text-emerald-700">Saved.</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 text-sm text-red-700">
            Could not save. Check that the schema is valid JSON.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
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
