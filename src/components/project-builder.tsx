"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { createProjectAction } from "@/app/projects/actions";
import { DynamicForm } from "@/components/dynamic-form";
import { AdvancedJsonEditor } from "@/components/project-detail/advanced-json-editor";
import { FieldsEditor } from "@/components/project-detail/fields-editor";
import { PagesEditor } from "@/components/project-detail/pages-editor";
import { cleanValidation } from "@/components/project-detail/validation-utils";
import { publicMockProductUrl } from "@/lib/public-url";
import type { FormField, FormPage, ProjectSchema } from "@/lib/types";

const projectNamePlaceholder = "Optional. We can name this for you.";
const briefPlaceholder =
  "Describe the insight you want. We will choose the questions, field types, validation, and layout.";
const emptyPreviewSchema: ProjectSchema = {
  title: "Your generated form will appear here",
  description:
    "Add a brief, then let Atpio design the best data-gathering flow.",
  fields: [],
};

type ProjectBuilderProps = {
  generatedFromUrl?: boolean;
  initialBrief?: string;
  initialName?: string;
  initialSchema?: ProjectSchema;
  initialSource?: "ppio" | "local";
  generationError?: string;
  savedProjectId?: string;
};

export function ProjectBuilder({
  generatedFromUrl = false,
  initialBrief = "",
  initialName = "",
  initialSchema = emptyPreviewSchema,
  generationError = "",
  savedProjectId,
}: ProjectBuilderProps) {
  const [brief, setBrief] = useState(initialBrief);
  const [name, setName] = useState(initialName);
  const [schema, setSchema] = useState<ProjectSchema>(initialSchema);
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(initialSchema, null, 2),
  );
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [projectId, setProjectId] = useState(savedProjectId ?? "preview_project");
  const [status, setStatus] = useState<
    "idle" | "generating" | "revising" | "saving" | "saved"
  >(savedProjectId ? "saved" : "idle");
  const [errorMessage, setErrorMessage] = useState(generationError);
  const [sourceMessage, setSourceMessage] = useState(
    savedProjectId
      ? ""
      : generatedFromUrl
        ? "Form generated. Review the questions, then save it as a project."
        : "",
  );

  function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;

    if (submitter?.name === "intent" && submitter.value === "save") {
      void saveProject();
      return;
    }

    void generateSchema();
  }

  async function generateSchema() {
    const trimmedBrief = brief.trim();
    if (!trimmedBrief) {
      setErrorMessage("Add a brief before generating a schema.");
      setSourceMessage("");
      return;
    }

    setErrorMessage("");
    setSourceMessage(
      "Designing the best form, questions, field types, and validation.",
    );
    setStatus("generating");

    try {
      const response = await fetch("/api/projects/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmedBrief }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Schema generation failed.");
      }

      const payload = await response.json();
      setName(payload.name);
      updateSchemaState(payload.schema);
      setSourceMessage(
        payload.source === "ppio"
          ? "Generated with PPIO. Review the questions, then save it as a project."
          : "Generated locally. Review the questions, then save it as a project.",
      );
      setStatus("idle");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not generate schema with PPIO.",
      );
      setStatus("idle");
    }
  }

  async function saveProject() {
    const trimmedBrief = brief.trim();
    if (!trimmedBrief) {
      setErrorMessage("Add a brief before saving the project.");
      setSourceMessage("");
      return;
    }

    setStatus("saving");
    setErrorMessage("");
    setSourceMessage("");
    try {
      const result = await createProjectAction({ brief: trimmedBrief, name, schema });

      if (!result.project) throw new Error(result.error);

      setProjectId(result.project.id);
      updateSchemaState(result.project.schema);
      setStatus("saved");
    } catch {
      setErrorMessage(
        "Could not save the project. Make sure the local Atpio server is running, then try again.",
      );
      setStatus("idle");
    }
  }

  async function reviseWithAi() {
    const trimmedBrief = brief.trim();
    const trimmedInstructions = revisionInstructions.trim();

    if (!trimmedBrief) {
      setErrorMessage("Add a brief before asking Atpio to revise the form.");
      setSourceMessage("");
      return;
    }

    if (!trimmedInstructions) {
      setErrorMessage("Add revision notes before asking Atpio to revise.");
      setSourceMessage("");
      return;
    }

    setErrorMessage("");
    setSourceMessage("Applying your revision notes to the current form.");
    setStatus("revising");

    try {
      const response = await fetch("/api/projects/revise-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: trimmedBrief,
          instructions: trimmedInstructions,
          schema,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Schema revision failed.");
      }

      const payload = await response.json();
      setName(payload.name);
      updateSchemaState(payload.schema);
      setRevisionInstructions("");
      setSourceMessage("Revision applied. Review the changes, then save it.");
      setStatus("idle");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not revise schema with PPIO.",
      );
      setStatus("idle");
    }
  }

  function slugify(value: string) {
    return (
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "field"
    );
  }

  function updateSchemaState(nextSchema: ProjectSchema) {
    setSchema(nextSchema);
    setSchemaText(JSON.stringify(nextSchema, null, 2));
  }

  function updateSchema(updater: (current: ProjectSchema) => ProjectSchema) {
    setStatus("idle");
    setSourceMessage("");
    setErrorMessage("");
    setSchema((current) => {
      const nextSchema = updater(current);
      setSchemaText(JSON.stringify(nextSchema, null, 2));
      return nextSchema;
    });
  }

  function updatePage(pageId: string, patch: Partial<FormPage>) {
    updateSchema((current) => ({
      ...current,
      pages: (current.pages ?? []).map((page) =>
        page.id === pageId ? { ...page, ...patch } : page,
      ),
      fields:
        patch.id && patch.id !== pageId
          ? current.fields.map((field) =>
              field.pageId === pageId ? { ...field, pageId: patch.id } : field,
            )
          : current.fields,
    }));
  }

  function addPage() {
    updateSchema((current) => {
      const nextIndex = (current.pages?.length ?? 0) + 1;
      return {
        ...current,
        pages: [
          ...(current.pages ?? []),
          { id: `page_${nextIndex}`, title: `Page ${nextIndex}` },
        ],
      };
    });
  }

  function removePage(pageId: string) {
    updateSchema((current) => ({
      ...current,
      pages: current.pages?.filter((page) => page.id !== pageId),
      fields: current.fields.map((field) =>
        field.pageId === pageId ? { ...field, pageId: undefined } : field,
      ),
    }));
  }

  function updateField(fieldId: string, patch: Partial<FormField>) {
    updateSchema((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    }));
  }

  function addField() {
    updateSchema((current) => {
      const nextIndex = current.fields.length + 1;
      return {
        ...current,
        fields: [
          ...current.fields,
          {
            id: `field_${nextIndex}`,
            type: "short_text",
            label: `Question ${nextIndex}`,
            required: false,
            pageId: current.pages?.[0]?.id,
          },
        ],
      };
    });
  }

  function duplicateField(fieldId: string) {
    updateSchema((current) => {
      const index = current.fields.findIndex((field) => field.id === fieldId);
      if (index < 0) return current;

      const field = current.fields[index];
      const copy: FormField = {
        ...field,
        id: uniqueFieldId(current.fields, `${field.id}_copy`),
        label: `${field.label} copy`,
      };
      const fields = [...current.fields];
      fields.splice(index + 1, 0, copy);
      return { ...current, fields };
    });
  }

  function moveField(fieldId: string, direction: "up" | "down") {
    updateSchema((current) => {
      const index = current.fields.findIndex((field) => field.id === fieldId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.fields.length) {
        return current;
      }

      const fields = [...current.fields];
      const [field] = fields.splice(index, 1);
      fields.splice(nextIndex, 0, field);
      return { ...current, fields };
    });
  }

  function removeField(fieldId: string) {
    updateSchema((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== fieldId),
    }));
  }

  function updateValidation(
    fieldId: string,
    key: keyof NonNullable<FormField["validation"]>,
    value: number | undefined,
  ) {
    updateSchema((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === fieldId
          ? { ...field, validation: cleanValidation(field.validation, key, value) }
          : field,
      ),
    }));
  }

  function applySchemaText() {
    try {
      const parsedSchema = JSON.parse(schemaText) as ProjectSchema;
      updateSchemaState(parsedSchema);
      setErrorMessage("");
      setSourceMessage("JSON applied. Review the preview, then save it.");
    } catch {
      setErrorMessage("Could not apply JSON. Check that the schema is valid.");
      setSourceMessage("");
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      {status === "generating" || status === "revising" || status === "saving" ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#f7f1e8]/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-7 text-center shadow-xl">
            <span
              aria-hidden="true"
              className="size-10 animate-spin rounded-full border-4 border-emerald-700 border-r-transparent"
            />
            <div>
              <p className="text-base font-semibold text-slate-950">
                {status === "generating"
                  ? "Designing your form"
                  : status === "revising"
                    ? "Revising your form"
                    : "Saving your project"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {status === "generating"
                  ? "Atpio is choosing the best questions, field types, validation, and layout."
                  : status === "revising"
                    ? "Atpio is applying your notes to the current questionnaire."
                    : "We are making this project available to the mock product."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {status === "saved" ? (
        <div
          className="fixed left-1/2 top-6 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-slate-950 shadow-xl"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-semibold text-white"
            >
              OK
            </span>
            <div>
              <p className="font-semibold">Project saved successfully.</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                It is now available in All projects and will be used by the
                mock product at {publicMockProductUrl}.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <form
        action="/projects/new/save"
        className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur"
        method="post"
        onSubmit={handleProjectSubmit}
      >
        <textarea
          className="hidden"
          name="schema"
          readOnly
          value={JSON.stringify(schema)}
        />
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-emerald-700">
              Project creator
            </p>
            <Link
              className="rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700"
              href="/projects"
            >
              All projects
            </Link>
          </div>
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight">
            Turn a research brief into a collection form.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Describe the insight you want. Atpio turns it into a structured
            collection form with the right questions, field types, validation,
            and layout.
          </p>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-900">
            Project name <span className="font-normal text-slate-500">(optional)</span>
          </span>
          <input
            aria-label="Project name"
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 bg-white/90 px-3 text-sm outline-none focus:border-emerald-600"
            id="project-name"
            name="name"
            placeholder={projectNamePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-900">Brief</span>
          <textarea
            aria-label="Brief"
            className="mt-2 min-h-40 w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            id="project-brief"
            name="brief"
            placeholder={briefPlaceholder}
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 text-sm font-medium text-slate-800"
            disabled={
              status === "generating" ||
              status === "revising" ||
              status === "saving"
            }
            formAction="/projects/new"
            formMethod="get"
            name="generate"
            type="submit"
            value="1"
          >
            {status === "generating" ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              "Generate best form"
            )}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white"
            disabled={status === "saving" || status === "revising"}
            name="intent"
            type="submit"
            value="save"
          >
            {status === "saving" ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Save project"
            )}
          </button>
        </div>

        {status === "generating" ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <Spinner />
            <span>
              Atpio is choosing the best questions, fields, validation, and
              layout. This can take a moment.
            </span>
          </div>
        ) : null}

        {sourceMessage ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {sourceMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Edit generated questionnaire
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Fine-tune the generated form before saving. You can edit copy,
              field type, options, validation, pages, order, and required
              status.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Ask Atpio to revise
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Give high-level feedback and Atpio will update the current
                  questionnaire while preserving useful manual edits.
                </p>
              </div>
              <button
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-medium text-white disabled:opacity-50"
                disabled={status === "revising" || status === "saving"}
                onClick={reviseWithAi}
                type="button"
              >
                {status === "revising" ? (
                  <>
                    <Spinner />
                    Revising...
                  </>
                ) : (
                  "Revise with Atpio"
                )}
              </button>
            </div>
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
              placeholder="Example: Add more price-sensitivity questions, reduce open-ended questions, and make the wording friendlier for students."
              value={revisionInstructions}
              onChange={(event) => setRevisionInstructions(event.target.value)}
            />
          </div>

          <div className="mt-4 grid gap-4">
            <label className="text-sm">
              <span className="font-medium text-slate-800">Form title</span>
              <input
                className="mt-2 h-10 w-full rounded-md border border-stone-300 bg-white px-3"
                value={schema.title}
                onChange={(event) =>
                  updateSchema((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-800">Description</span>
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border border-stone-300 bg-white px-3 py-2"
                value={schema.description}
                onChange={(event) =>
                  updateSchema((current) => ({
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
            onAddPage={addPage}
            onRemovePage={removePage}
            onUpdatePage={updatePage}
          />

          <FieldsEditor
            fields={schema.fields}
            pages={schema.pages ?? []}
            slugify={slugify}
            onAddField={addField}
            onDuplicateField={duplicateField}
            onMoveField={moveField}
            onRemoveField={removeField}
            onUpdateField={updateField}
            onUpdateValidation={updateValidation}
          />

          <AdvancedJsonEditor
            value={schemaText}
            onApply={applySchemaText}
            onChange={setSchemaText}
          />
        </div>

        {status === "saved" ? (
          <div
            className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900"
            role="status"
          >
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
              >
                OK
              </span>
              <div>
                <p className="font-semibold">Project saved successfully.</p>
                <p className="mt-1 text-emerald-800">
                  This is now the latest Atpio project. The mock product will
                  load it automatically at {publicMockProductUrl}.
                </p>
                <p className="mt-2 text-xs text-emerald-700">
                  Embed path: /embed/{projectId}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex h-9 items-center rounded-full bg-emerald-700 px-3 text-sm font-medium text-white"
                href={`/projects/${projectId}`}
              >
                Open project detail
              </Link>
              <a
                className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-800"
                href={publicMockProductUrl}
                rel="noreferrer"
                target="_blank"
              >
                Test in mock product
              </a>
              <Link
                className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-800"
                href="/projects"
              >
                View all projects
              </Link>
            </div>
          </div>
        ) : null}
      </form>

      <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <p className="mb-4 text-sm font-medium text-slate-500">
          Generated form preview
        </p>
        <DynamicForm projectId={projectId} previewMode schema={schema} />
      </section>
    </div>
  );
}

function uniqueFieldId(fields: FormField[], baseId: string) {
  const existingIds = new Set(fields.map((field) => field.id));
  let candidate = baseId;
  let suffix = 2;

  while (existingIds.has(candidate)) {
    candidate = `${baseId}_${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}
