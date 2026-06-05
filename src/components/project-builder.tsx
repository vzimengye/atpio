"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { DynamicForm } from "@/components/dynamic-form";
import { sampleProject } from "@/lib/mock-data";
import { generateSchemaFromBrief, projectNameFromBrief } from "@/lib/schema-generator";
import type { ProjectSchema } from "@/lib/types";

const projectNamePlaceholder = "Name this data collection project";
const briefPlaceholder =
  "Describe what you want to learn from users, customers, or visitors.";

type ProjectBuilderProps = {
  generatedFromUrl?: boolean;
  initialBrief?: string;
  initialName?: string;
  initialSchema?: ProjectSchema;
};

export function ProjectBuilder({
  generatedFromUrl = false,
  initialBrief = "",
  initialName = "",
  initialSchema = sampleProject.schema,
}: ProjectBuilderProps) {
  const [brief, setBrief] = useState(initialBrief);
  const [name, setName] = useState(initialName);
  const [schema, setSchema] = useState<ProjectSchema>(initialSchema);
  const [projectId, setProjectId] = useState(sampleProject.id);
  const [status, setStatus] = useState<
    "idle" | "generating" | "saving" | "saved"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [sourceMessage, setSourceMessage] = useState(
    generatedFromUrl ? "Generated with the local page fallback." : "",
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
    setSourceMessage("Generated a local preview. Checking PPIO for a better schema...");
    const localSchema = generateSchemaFromBrief(trimmedBrief);
    const localName = projectNameFromBrief(trimmedBrief);
    setName(localName);
    setSchema(localSchema);
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
          ? "Generated with PPIO."
          : "Generated with the local fallback because PPIO was unavailable or slow.",
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
        body: JSON.stringify({ brief: trimmedBrief, name }),
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
            Atpio generates a structured feedback schema from a natural-language
            brief. This local generator is deterministic, so the project works
            without an API key.
          </p>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-900">Project name</span>
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
                Generating...
              </>
            ) : (
              "Generate schema"
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
              Local preview is ready. Atpio is checking PPIO for a better schema.
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
        <DynamicForm projectId={projectId} schema={schema} />
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
