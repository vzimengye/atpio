"use client";

import { useState } from "react";
import { DynamicForm } from "@/components/dynamic-form";
import { AdminTokenPanel } from "@/components/admin-token-panel";
import { sampleProject } from "@/lib/mock-data";
import { getAdminHeaders } from "@/lib/admin-client";
import type { ProjectSchema } from "@/lib/types";

const defaultBrief =
  "Find out why users do not finish onboarding and which step feels confusing.";

export function ProjectBuilder() {
  const [brief, setBrief] = useState(defaultBrief);
  const [name, setName] = useState("Onboarding Feedback Project");
  const [schema, setSchema] = useState<ProjectSchema>(sampleProject.schema);
  const [projectId, setProjectId] = useState(sampleProject.id);
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");

  async function generateSchema() {
    setStatus("loading");
    const response = await fetch("/api/projects/generate-schema", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ brief }),
    });
    const payload = await response.json();
    setName(payload.name);
    setSchema(payload.schema);
    setStatus("idle");
  }

  async function saveProject() {
    setStatus("loading");
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ brief, name }),
    });
    const payload = await response.json();
    setProjectId(payload.project.id);
    setSchema(payload.project.schema);
    setStatus("saved");
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <AdminTokenPanel />

        <div className="mt-6">
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
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 bg-white/90 px-3 text-sm outline-none focus:border-emerald-600"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-900">Brief</span>
          <textarea
            className="mt-2 min-h-40 w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 text-sm font-medium text-slate-800"
            disabled={status === "loading"}
            onClick={generateSchema}
          >
            Generate schema
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white"
            disabled={status === "loading"}
            onClick={saveProject}
          >
            Save project
          </button>
        </div>

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
