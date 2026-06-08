"use client";

import Link from "next/link";
import { GadgetSettingsPanel } from "@/components/project-detail/gadget-settings-panel";
import type { DataProject, GadgetSettings } from "@/lib/types";

type ProjectSummaryPanelProps = {
  embedCode: string;
  project: DataProject;
  responseCount: number;
  onProjectChange: (project: DataProject) => void;
  onUpdateGadget: <K extends keyof GadgetSettings>(
    key: K,
    value: GadgetSettings[K],
  ) => void;
};

export function ProjectSummaryPanel({
  embedCode,
  project,
  responseCount,
  onProjectChange,
  onUpdateGadget,
}: ProjectSummaryPanelProps) {
  return (
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
          onProjectChange({ ...project, name: event.target.value })
        }
      />
      <textarea
        className="mt-4 min-h-28 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm leading-6 outline-none focus:border-emerald-600"
        value={project.brief}
        onChange={(event) =>
          onProjectChange({ ...project, brief: event.target.value })
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Responses" value={responseCount} />
        <Metric label="Fields" value={project.schema.fields.length} />
        <Metric label="Pages" value={project.schema.pages?.length ?? 1} />
      </div>

      <GadgetSettingsPanel gadget={project.gadget} onUpdate={onUpdateGadget} />

      <div className="mt-6 rounded-xl bg-slate-950 p-4 text-slate-50">
        <p className="text-sm font-medium">Embed code</p>
        <pre className="mt-3 whitespace-pre-wrap break-all text-xs leading-6">
          {embedCode}
        </pre>
      </div>
    </section>
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
