"use client";

import { useState } from "react";
import { DynamicForm } from "@/components/dynamic-form";
import { sampleProject } from "@/lib/mock-data";
import type { ProjectSchema } from "@/lib/types";

const defaultBrief =
  "Find out why users do not finish onboarding and which step feels confusing.";

export function ProjectBuilder() {
  const [brief, setBrief] = useState(defaultBrief);
  const [name, setName] = useState("Onboarding Feedback Project");
  const [schema, setSchema] = useState<ProjectSchema>(sampleProject.schema);
  const [projectId, setProjectId] = useState(sampleProject.id);
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function generateSchema() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/projects/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });

      if (!response.ok) {
        throw new Error("Schema generation failed.");
      }

      const payload = await response.json();
      setName(payload.name);
      setSchema(payload.schema);
      setStatus("idle");
    } catch {
      setErrorMessage(
        "Could not generate a schema. Make sure the local Atpio server is running, then try again.",
      );
      setStatus("idle");
    }
  }

  async function saveProject() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, name }),
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
      <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Project creator
          </p>
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
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 text-sm font-medium text-slate-800"
            disabled={status === "loading"}
            onClick={generateSchema}
            type="button"
          >
            {status === "loading" ? "Working..." : "Generate schema"}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white"
            disabled={status === "loading"}
            onClick={saveProject}
            type="button"
          >
            {status === "loading" ? "Working..." : "Save project"}
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {status === "saved" ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Saved. Embed path: /embed/{projectId}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <p className="mb-4 text-sm font-medium text-slate-500">
          Generated form preview
        </p>
        <DynamicForm projectId={projectId} schema={schema} />
      </section>
    </div>
  );
}
