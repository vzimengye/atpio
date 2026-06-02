"use client";

import { useMemo, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-client";
import type { DataProject, GadgetSettings, ProjectResponse } from "@/lib/types";

type ProjectDetailEditorProps = {
  initialProject: DataProject;
  responses: ProjectResponse[];
};

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
      `<script src="http://127.0.0.1:3000/gadget.js" data-project-id="${project.id}" data-atpio-position="${project.gadget.position}" data-atpio-theme="${project.gadget.theme}" data-atpio-label="${project.gadget.buttonLabel}"></script>`,
    [project.gadget.buttonLabel, project.gadget.position, project.gadget.theme, project.id],
  );

  function updateGadget<K extends keyof GadgetSettings>(
    key: K,
    value: GadgetSettings[K],
  ) {
    setProject((current) => ({
      ...current,
      gadget: { ...current.gadget, [key]: value },
    }));
  }

  async function saveChanges() {
    setStatus("saving");
    try {
      const parsedSchema = JSON.parse(schemaText);
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
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
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-emerald-700">Project detail</p>
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
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-950 p-4 text-slate-50">
          <p className="text-sm font-medium">Embed code</p>
          <pre className="mt-3 overflow-x-auto text-xs leading-6">{embedCode}</pre>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Schema editor</p>
            <h1 className="mt-1 text-2xl font-semibold">Edit generated schema</h1>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
            disabled={status === "saving"}
            onClick={saveChanges}
          >
            Save changes
          </button>
        </div>
        <textarea
          className="mt-5 min-h-[520px] w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 font-mono text-xs leading-6 outline-none focus:border-emerald-600"
          spellCheck={false}
          value={schemaText}
          onChange={(event) => setSchemaText(event.target.value)}
        />
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

