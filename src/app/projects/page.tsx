import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ActiveProjectButton } from "@/components/active-project-button";
import { SignOutButton } from "@/components/sign-out-button";
import { getUserByEmail, listProjects } from "@/lib/store";
import { publicAppUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const ownerEmail = session.user.email ?? undefined;
  const [projects, account] = await Promise.all([
    listProjects(ownerEmail),
    ownerEmail ? getUserByEmail(ownerEmail) : null,
  ]);
  const activeProjectId = account?.activeProjectId ?? projects[0]?.id;
  const mockProductUrl =
    process.env.NEXT_PUBLIC_MOCK_PRODUCT_URL ?? "https://mock-product.vercel.app";
  const workspaceKey = account?.publicKey;

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
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-5 text-sm font-medium text-slate-700"
              href="/"
            >
              Atpio home
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white"
              href="/projects/new"
            >
              Generate new form
            </Link>
            <SignOutButton />
          </div>
        </div>

        {workspaceKey ? (
          <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-sm text-emerald-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold">Your workspace embed key</p>
                <p className="mt-1 text-emerald-800">
                  Customer sites can load your active Atpio project with this
                  public key. If no project is marked active, Atpio uses your
                  newest project.
                </p>
                <code className="mt-3 block overflow-x-auto rounded-xl bg-white/80 px-3 py-2 text-slate-800">
                  data-atpio-workspace-key=&quot;{workspaceKey}&quot;
                </code>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-5 font-medium text-white"
                  href={`${mockProductUrl}?workspaceKey=${encodeURIComponent(workspaceKey)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open mock product
                </a>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-white px-5 font-medium text-emerald-800"
                  href={`${publicAppUrl}/api/projects/latest?workspaceKey=${encodeURIComponent(workspaceKey)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Test latest API
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white/80 p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold">No projects yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Generate your first Atpio form, then mark it active so connected
                mock products and customer sites can load it.
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white"
                href="/projects/new"
              >
                Generate new form
              </Link>
            </div>
          ) : null}
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    {project.status}
                  </p>
                  <Link className="mt-1 block text-xl font-semibold" href={`/projects/${project.id}`}>
                    {project.name}
                  </Link>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {project.brief}
                  </p>
                  <div className="mt-4">
                    <ActiveProjectButton
                      isActive={project.id === activeProjectId}
                      projectId={project.id}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <MiniMetric label="Responses" value={project.responseCount} />
                  <MiniMetric label="Fields" value={project.schema.fields.length} />
                  <MiniMetric label="Pages" value={project.schema.pages?.length ?? 1} />
                </div>
              </div>
            </article>
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
