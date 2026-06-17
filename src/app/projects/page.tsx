import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ActiveProjectButton } from "@/components/active-project-button";
import { SignOutButton } from "@/components/sign-out-button";
import { getUiLanguageFromParams, langPath, type UiLanguage } from "@/lib/i18n";
import { getUserByEmail, listProjects } from "@/lib/store";
import { buildDemoProductUrl, publicAppUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

const copy = {
  en: {
    eyebrow: "Atpio projects",
    title: "Project workspace",
    home: "Atpio home",
    newProject: "New project",
    workspaceKey: "Your public embed key",
    workspaceText:
      "Customer sites can load your active Atpio project with this public key. If no project is marked active, Atpio uses your newest project.",
    openMock: "Open demo product",
    testApi: "Preview active project data",
    emptyTitle: "No projects yet",
    emptyText:
      "Generate your first Atpio form, then mark it active so connected demo products and customer sites can load it.",
    responses: "Responses",
    fields: "Fields",
    pages: "Pages",
  },
  zh: {
    eyebrow: "Atpio 项目",
    title: "项目空间",
    home: "Atpio 首页",
    newProject: "新建项目",
    workspaceKey: "你的公开接入密钥",
    workspaceText:
      "外部网站可以用这个公开密钥加载你选中的 Atpio 项目。如果还没有手动选择，Atpio 会使用你最新保存的项目。",
    openMock: "打开示例产品",
    testApi: "预览当前项目数据",
    emptyTitle: "还没有项目",
    emptyText:
      "先生成第一个 Atpio 问卷，然后把它设为外部展示项目，这样示例产品和客户网站就能加载它。",
    responses: "回答",
    fields: "问题",
    pages: "页面",
  },
} satisfies Record<UiLanguage, Record<string, string>>;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lang = getUiLanguageFromParams(params);
  const t = copy[lang];
  const session = await auth();
  if (!session?.user) redirect(langPath("/login", lang));

  const ownerEmail = session.user.email ?? undefined;
  const [projects, account] = await Promise.all([
    listProjects(ownerEmail),
    ownerEmail ? getUserByEmail(ownerEmail) : null,
  ]);
  const activeProjectId = account?.activeProjectId ?? projects[0]?.id;
  const workspaceKey = account?.publicKey;
  const nextLang = lang === "zh" ? "en" : "zh";

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-stone-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">{t.eyebrow}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {t.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-5 text-sm font-medium text-slate-700"
              href={langPath("/", lang)}
            >
              {t.home}
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white"
              href={langPath("/projects/new", lang)}
            >
              {t.newProject}
            </Link>
            <Link
              className={`inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium ${
                lang === "zh"
                  ? "border border-stone-300 bg-white/70 text-slate-700"
                  : "bg-slate-950 text-white"
              }`}
              href={langPath("/projects", nextLang)}
            >
              {lang === "zh" ? "EN" : "中"}
            </Link>
            <SignOutButton label={lang === "zh" ? "退出登录" : "Sign out"} />
          </div>
        </div>

        {workspaceKey ? (
          <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-sm text-emerald-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold">{t.workspaceKey}</p>
                <p className="mt-1 text-emerald-800">
                  {t.workspaceText}
                </p>
                <code className="mt-3 block overflow-x-auto rounded-xl bg-white/80 px-3 py-2 text-slate-800">
                  data-atpio-workspace-key=&quot;{workspaceKey}&quot;
                </code>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-5 font-medium text-white"
                  href={buildDemoProductUrl({
                    lang,
                    workspaceKey,
                  })}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t.openMock}
                </a>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-white px-5 font-medium text-emerald-800"
                  href={`${publicAppUrl}/api/projects/latest?workspaceKey=${encodeURIComponent(workspaceKey)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t.testApi}
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white/80 p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold">{t.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {t.emptyText}
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white"
                href={langPath("/projects/new", lang)}
              >
                {t.newProject}
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
                  <Link
                    className="mt-1 block text-xl font-semibold"
                    href={langPath(`/projects/${project.id}`, lang)}
                  >
                    {project.name}
                  </Link>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {project.brief}
                  </p>
                  <div className="mt-4">
                    <ActiveProjectButton
                      isActive={project.id === activeProjectId}
                      uiLanguage={lang}
                      projectId={project.id}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <MiniMetric label={t.responses} value={project.responseCount} />
                  <MiniMetric label={t.fields} value={project.schema.fields.length} />
                  <MiniMetric label={t.pages} value={project.schema.pages?.length ?? 1} />
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
