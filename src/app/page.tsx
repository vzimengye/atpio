import { sampleInsightRun, sampleProject } from "@/lib/mock-data";
import type { FormField } from "@/lib/types";
import { AnalyzeButton } from "@/components/analyze-button";
import { getLatestInsight, listProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

const statusLabels = {
  draft: "Draft",
  collecting: "Collecting",
  analyzing: "Analyzing",
  ready: "Ready",
};

function FieldPreview({ field }: { field: FormField }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-950">{field.label}</p>
          <p className="mt-1 text-xs uppercase text-slate-500">{field.type}</p>
        </div>
        {field.required ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Required
          </span>
        ) : null}
      </div>
      {field.options ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {field.options.map((option) => (
            <span
              key={option}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
            >
              {option}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default async function Home() {
  const projects = await listProjects();
  const project = projects[0] ?? sampleProject;
  const insightRun = (await getLatestInsight(project.id)) ?? sampleInsightRun;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Atpio console
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Collect feedback, then send it to OpenClio.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              This first screen turns the Atpio plan into a working product
              shell: create a data gathering project, preview the generated
              schema, embed the gadget, and prepare an OpenClio analysis run.
            </p>
          </div>
          <a
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
            href="/projects/new"
          >
            New project
          </a>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Projects", "1"],
            ["Responses", String(project.responseCount)],
            ["Analysis engine", "OpenClio"],
            ["Status", statusLabels[project.status]],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active project
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{project.name}</h2>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {statusLabels[project.status]}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {project.brief}
            </p>

            <div className="mt-6 grid gap-3">
              <h3 className="text-sm font-semibold text-slate-950">
                Generated schema preview
              </h3>
              {project.schema.fields.map((field) => (
                <FieldPreview key={field.id} field={field} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Embed gadget</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Other products can mount the collection form with a project id.
                The next implementation step is to expose this through
                `/embed/[projectId]` and `/gadget.js`.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-50">
                {`<script
  src="https://your-domain.com/gadget.js"
  data-project-id="${project.id}">
</script>`}
              </pre>
              <a
                className="mt-4 inline-flex text-sm font-medium text-emerald-700"
                href={`/embed/${project.id}`}
              >
                Open embed preview
              </a>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold">OpenClio adapter</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>1. Load project responses from storage.</li>
                <li>2. Convert answers into OpenClio input records.</li>
                <li>3. Run `clio.runClio` in a Python worker.</li>
                <li>4. Save output files and expose the report.</li>
              </ol>
              <div className="mt-5">
                <AnalyzeButton projectId={project.id} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Mock analysis output
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Themes from {insightRun.inputCount} collected responses
              </h2>
              {insightRun.summary ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {insightRun.summary}
                </p>
              ) : null}
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {insightRun.engine}
            </span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {insightRun.themes.map((theme) => (
              <article
                key={theme.name}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="text-sm font-medium text-emerald-700">
                  {theme.count} responses
                </p>
                <h3 className="mt-2 font-semibold text-slate-950">
                  {theme.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {theme.summary}
                </p>
              </article>
            ))}
          </div>
          {insightRun.recommendations?.length ? (
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">
                Recommendations
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {insightRun.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
