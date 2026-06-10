import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { FormField } from "@/lib/types";
import { listProjects, listResponses } from "@/lib/store";

export const dynamic = "force-dynamic";

const statusLabels = {
  draft: "Draft",
  collecting: "Collecting",
  ready: "Ready",
};

function FieldPreview({ field }: { field: FormField }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur">
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
              className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-slate-600"
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
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projects = await listProjects(session.user.email ?? undefined);
  const project = projects[0] ?? null;
  const responses = project ? await listResponses(project.id) : [];
  const requiredFields =
    project?.schema.fields.filter((field) => field.required).length ?? 0;

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-stone-300 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Atpio console
            </p>
            <h1 className="mt-2 max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-slate-950">
              Generate data gathering gadgets from natural-language briefs.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Your documents stay tied to your account: create a data gathering
              project, preview the generated schema, embed the gadget, and
              review your own response records.
            </p>
          </div>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-sm"
            href="/projects/new"
          >
            New project
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Projects", String(projects.length)],
            ["Responses", String(project?.responseCount ?? 0)],
            ["Fields", String(project?.schema.fields.length ?? 0)],
            ["Status", project ? statusLabels[project.status] : "None"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </section>

        {project ? (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
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
            <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold">Embed gadget</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Other products can mount the collection form with a project id.
                The next implementation step is to expose this through
                `/embed/[projectId]` and `/gadget.js`.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-50">
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

            <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold">Collection path</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>1. Create or generate a project schema.</li>
                <li>2. Mount the gadget from another product.</li>
                <li>3. Collect responses through the public endpoint.</li>
                <li>4. Review counts and latest collection status.</li>
              </ol>
            </div>
          </div>
        </section>
        ) : (
          <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 text-center shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-emerald-700">
              No documents yet
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Create your first data gathering project.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Atpio will save generated forms, edits, embed settings, and
              response records under your account.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white"
              href="/projects/new"
            >
              Generate first form
            </Link>
          </section>
        )}

        <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Collection summary
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {responses.length} response{responses.length === 1 ? "" : "s"} collected
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Atpio is currently focused on proving the data gathering flow:
                generated schema, embeddable gadget, public submission, and
                local persistence. Advanced analysis comes after this flow is
                stable.
              </p>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              TypeScript store
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-sm text-slate-500">Total responses</p>
              <p className="mt-2 text-2xl font-semibold">{responses.length}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-sm text-slate-500">Schema fields</p>
              <p className="mt-2 text-2xl font-semibold">
                {project.schema.fields.length}
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-sm text-slate-500">Required fields</p>
              <p className="mt-2 text-2xl font-semibold">{requiredFields}</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
