import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { getUiLanguageFromParams, langPath, type UiLanguage } from "@/lib/i18n";
import { sampleProject } from "@/lib/mock-data";
import { buildDemoProductUrl } from "@/lib/public-url";
import { listProjects, listResponses } from "@/lib/store";
import type { DataProject, FormField } from "@/lib/types";

export const dynamic = "force-dynamic";

const copy = {
  en: {
    eyebrow: "Atpio",
    title: "Turn product questions into embedded feedback forms.",
    subtitle:
      "Create an account to build your own workspace, or skip sign-in to learn how Atpio works and how to embed it in another product.",
    create: "Create account",
    signIn: "Sign in",
    skip: "Skip and view overview",
    languageToggle: "中",
    newProject: "New project",
    workspace: "Workspace",
    signedIn: "Signed in",
    overview: "Product overview",
    overviewText:
      "Atpio generates structured feedback forms from a natural-language brief, embeds them into another website, and stores the responses for the project owner.",
    activeProject: "Latest project preview",
    fields: "Fields",
    responses: "Responses",
    status: "Status",
    required: "Required",
    integrationTitle: "Demo product integration guide",
    integrationText:
      "Give this markdown guide to partners or customers so they can install the Atpio gadget in their own product. It covers workspace keys, fixed project IDs, metadata, events, and local testing.",
    download: "Download integration guide",
    mock: "Open demo product",
    flowTitle: "How it works",
    flow: [
      "Register or sign in to Atpio.",
      "Create a project by describing the product question you want to answer.",
      "Choose which saved project should appear inside your website or app.",
      "Copy the embed script into the product where you want to collect responses.",
      "Public users submit feedback without signing in.",
    ],
  },
  zh: {
    eyebrow: "Atpio",
    title: "把产品问题变成可嵌入的反馈问卷。",
    subtitle:
      "注册账号后可以创建自己的项目空间；也可以先跳过登录，了解 Atpio 如何工作，以及如何接入到自己的网页里。",
    create: "注册",
    signIn: "登录",
    skip: "跳过，先看介绍",
    languageToggle: "EN",
    newProject: "新建项目",
    workspace: "项目空间",
    signedIn: "已登录",
    overview: "产品介绍",
    overviewText:
      "Atpio 根据自然语言描述生成结构化反馈表单，把表单嵌入到另一个网站中，并把收集到的回答保存到项目创建者自己的项目空间。",
    activeProject: "最近项目预览",
    fields: "问题数",
    responses: "回答数",
    status: "状态",
    required: "必填",
    integrationTitle: "示例产品接入指南",
    integrationText:
      "这个文档可以给合作方或客户使用，说明如何把 Atpio 的反馈入口装进他们自己的产品里，包括项目空间密钥、固定项目编号、附加信息、事件通知和本地测试。",
    download: "下载接入指南",
    mock: "打开示例产品",
    flowTitle: "使用流程",
    flow: [
      "注册或登录 Atpio。",
      "用自然语言描述想了解的产品问题，创建一个反馈项目。",
      "在项目空间中选择要展示到外部产品里的项目。",
      "把嵌入代码复制到需要收集反馈的网站或应用里。",
      "外部产品的普通用户无需登录 Atpio，直接填写并提交反馈。",
    ],
  },
} satisfies Record<UiLanguage, Record<string, string | string[]>>;

const statusLabels = {
  en: {
    draft: "Draft",
    collecting: "Collecting",
    ready: "Ready",
  },
  zh: {
    draft: "草稿",
    collecting: "收集中",
    ready: "已就绪",
  },
};

const zhSampleProject: DataProject = {
  ...sampleProject,
  name: "新手引导反馈",
  brief: "了解用户为什么没有完成新手引导，以及哪一步让用户感到困惑。",
  schema: {
    title: "新手引导反馈",
    description: "面向暂停或退出新手引导用户的简短反馈问卷。",
    pages: [
      {
        id: "experience",
        title: "使用体验",
        description: "了解用户卡在哪一步。",
      },
      {
        id: "follow_up",
        title: "后续沟通",
        description: "确认是否可以继续了解细节。",
      },
    ],
    fields: [
      {
        id: "dropoff_reason",
        type: "long_text",
        label: "是什么让你没有完成新手引导？",
        required: true,
        pageId: "experience",
        placeholder: "请描述哪里不清楚、太慢或让你卡住。",
        validation: { minLength: 8, maxLength: 600 },
      },
      {
        id: "stuck_step",
        type: "single_select",
        label: "你卡在哪一步？",
        options: ["账号设置", "权限授权", "产品介绍", "其他"],
        pageId: "experience",
      },
      {
        id: "confidence",
        type: "rating",
        label: "你对下一步操作有多确定？",
        pageId: "follow_up",
        validation: { min: 1, max: 5 },
      },
    ],
  },
};

function getText(lang: UiLanguage, key: keyof (typeof copy)["en"]) {
  return copy[lang][key] as string;
}

const fieldTypeLabels = {
  en: {
    boolean: "Yes / no",
    long_text: "Long text",
    multi_select: "Multiple choice",
    rating: "Rating",
    short_text: "Short text",
    single_select: "Single choice",
  },
  zh: {
    boolean: "是或否",
    long_text: "长文本",
    multi_select: "多选",
    rating: "评分",
    short_text: "短文本",
    single_select: "单选",
  },
} satisfies Record<UiLanguage, Record<FormField["type"], string>>;

function FieldPreview({
  field,
  lang,
}: {
  field: FormField;
  lang: UiLanguage;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-950">{field.label}</p>
          <p className="mt-1 text-xs text-slate-500">
            {fieldTypeLabels[lang][field.type]}
          </p>
        </div>
        {field.required ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {getText(lang, "required")}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lang = getUiLanguageFromParams(params);
  const session = await auth();
  const projects = session?.user
    ? await listProjects(session.user.email ?? undefined)
    : [];
  const project = projects[0] ?? (lang === "zh" ? zhSampleProject : sampleProject);
  const responses = await listResponses(project.id);
  const activeStatus = statusLabels[lang][project.status];
  const nextLang: UiLanguage = lang === "zh" ? "en" : "zh";
  const actionClass =
    "inline-flex h-12 w-full min-w-0 items-center justify-center rounded-full border px-5 text-center text-sm font-semibold shadow-sm transition sm:w-40";
  const primaryActionClass = `${actionClass} border-slate-950 bg-slate-950 text-white hover:bg-slate-800`;
  const secondaryActionClass = `${actionClass} border-stone-300 bg-white/80 text-slate-800 hover:bg-white`;
  const languageActionClass =
    lang === "zh" ? secondaryActionClass : primaryActionClass;

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-stone-300 pb-8">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-emerald-700">
              {getText(lang, "eyebrow")}
            </p>
          </nav>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-slate-950">
                {getText(lang, "title")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {getText(lang, "subtitle")}
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-4">
              {session?.user ? (
                <>
                  <Link
                    className={primaryActionClass}
                    href={langPath("/projects/new", lang)}
                  >
                    {getText(lang, "newProject")}
                  </Link>
                  <Link
                    className={secondaryActionClass}
                    href={langPath("/projects", lang)}
                  >
                    {getText(lang, "workspace")}
                  </Link>
                  <SignOutButton
                    className={secondaryActionClass}
                    label={lang === "zh" ? "退出登录" : "Sign out"}
                  />
                  <Link className={languageActionClass} href={langPath("/", nextLang)}>
                    {getText(lang, "languageToggle")}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    className={primaryActionClass}
                    href={langPath("/register", lang)}
                  >
                    {getText(lang, "create")}
                  </Link>
                  <Link
                    className={secondaryActionClass}
                    href={langPath("/login", lang)}
                  >
                    {getText(lang, "signIn")}
                  </Link>
                  <a
                    className={secondaryActionClass}
                    href="#overview"
                  >
                    {getText(lang, "skip")}
                  </a>
                  <Link className={languageActionClass} href={langPath("/", nextLang)}>
                    {getText(lang, "languageToggle")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <section
          className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
          id="overview"
        >
          <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-slate-500">
              {getText(lang, "overview")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {getText(lang, "activeProject")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {getText(lang, "overviewText")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label={getText(lang, "fields")} value={project.schema.fields.length} />
              <Metric label={getText(lang, "responses")} value={responses.length} />
              <Metric label={getText(lang, "status")} value={activeStatus} />
            </div>

            <div className="mt-6 grid gap-3">
              {project.schema.fields.slice(0, 4).map((field) => (
                <FieldPreview key={field.id} field={field} lang={lang} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold">
                {getText(lang, "integrationTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {getText(lang, "integrationText")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white"
                  href="/resources/mock-product-integration-skill"
                >
                  {getText(lang, "download")}
                </a>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 text-sm font-medium text-slate-700"
                  href={buildDemoProductUrl({ lang })}
                  rel="noreferrer"
                  target="_blank"
                >
                  {getText(lang, "mock")}
                </a>
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold">
                {getText(lang, "flowTitle")}
              </h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {(copy[lang].flow as string[]).map((item, index) => (
                  <li key={item}>
                    {index + 1}. {item}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
