"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { DynamicForm } from "@/components/dynamic-form";
import type { ProjectSchema } from "@/lib/types";

const projectNamePlaceholder = "Optional. We can name this for you.";
const briefPlaceholder =
  "Describe the insight you want. We will choose the questions, field types, validation, and layout.";
const emptyPreviewSchema: ProjectSchema = {
  title: "Your AI-generated form will appear here",
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
};

export function ProjectBuilder({
  generatedFromUrl = false,
  initialBrief = "",
  initialName = "",
  initialSchema = emptyPreviewSchema,
  initialSource,
}: ProjectBuilderProps) {
  const [brief, setBrief] = useState(initialBrief);
  const [name, setName] = useState(initialName);
  const [schema, setSchema] = useState<ProjectSchema>(initialSchema);
  const [projectId, setProjectId] = useState("preview_project");
  const [status, setStatus] = useState<
    "idle" | "generating" | "saving" | "saved"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [sourceMessage, setSourceMessage] = useState(
    generatedFromUrl
      ? initialSource === "ppio"
        ? "Generated with PPIO. AI selected the form structure and questions."
        : "PPIO was unavailable or slow, so Atpio generated a local fallback."
      : "",
  );

  function handleGenerateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      "Asking PPIO to design the best form, questions, field types, and validation.",
    );
    setStatus("generating");

    try {
      const response = await fetch("/api/projects/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmedBrief }),
      });

      if (!response.ok) {
        throw new Error("Schema generation failed.");
      }

      const payload = await response.json();
      setName(payload.name);
      setSchema(payload.schema);
      setSourceMessage(
        payload.source === "ppio"
          ? "Generated with PPIO. AI selected the form structure and questions."
          : "PPIO was unavailable or slow, so Atpio generated a local fallback.",
      );
      setStatus("idle");
    } catch {
      setErrorMessage(
        "Could not reach the schema API. The local preview is still available.",
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
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmedBrief, name, schema }),
      });

      if (!response.ok) {
        throw new Error("Project save failed.");
      }

      const payload = await response.json();
      setProjectId(payload.project.id);
      setSchema(payload.project.schema);
      setStatus("saved");
    } catch {
      setErrorMessage(
        "Could not save the project. Make sure the local Atpio server is running, then try again.",
      );
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      {status === "generating" || status === "saving" ? (
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
                  : "Saving your project"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {status === "generating"
                  ? "We are asking PPIO to choose the best questions, field types, validation, and layout."
                  : "We are making this project available to the mock product."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <form
        action="/projects/new"
        className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur"
        method="get"
        onSubmit={handleGenerateSubmit}
      >
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
            Describe the insight you want. Atpio asks PPIO to choose the best
            questions, field types, validation, and layout for the form.
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
            disabled={status === "generating" || status === "saving"}
            name="generate"
            type="submit"
            value="1"
          >
            {status === "generating" ? (
              <>
                <Spinner />
                Asking AI...
              </>
            ) : (
              "Generate best form with AI"
            )}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white"
            disabled={status === "saving"}
            onClick={saveProject}
            type="button"
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
              PPIO is choosing the best questions, fields, validation, and
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

        {status === "saved" ? (
          <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
            <p>Saved. Embed path: /embed/{projectId}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                className="inline-flex h-9 items-center rounded-full bg-emerald-700 px-3 text-sm font-medium text-white"
                href={`/projects/${projectId}`}
              >
                Open project detail
              </Link>
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

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}
