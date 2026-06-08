import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { listProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projects = await listProjects();

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-stone-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Atpio projects</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Data gathering workspace
            </h1>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white"
            href="/projects/new"
          >
            Generate new form
          </Link>
          <SignOutButton />
        </div>

        <section className="mt-8 grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/projects/${project.id}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    {project.status}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{project.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {project.brief}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <MiniMetric label="Responses" value={project.responseCount} />
                  <MiniMetric label="Fields" value={project.schema.fields.length} />
                  <MiniMetric label="Pages" value={project.schema.pages?.length ?? 1} />
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-xl bg-stone-50 px-3 py-2">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
