"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { createProjectAction } from "@/app/projects/actions";
import { DynamicForm } from "@/components/dynamic-form";
import type { UiLanguage } from "@/lib/i18n";
import { publicMockProductUrl } from "@/lib/public-url";
import type { ProjectSchema } from "@/lib/types";

const builderCopy = {
  en: {
    projectNamePlaceholder: "Optional. We can name this for you.",
    briefPlaceholder:
      "Describe the insight you want. We will choose the questions, field types, validation, and layout.",
    projectCreator: "Project creator",
    allProjects: "All projects",
    title: "Turn a research brief into a collection form.",
    subtitle:
      "Describe the insight you want. Atpio turns it into a structured collection form with the right questions, field types, validation, and layout. Use AI revision here, then fine-tune individual fields after saving.",
    projectName: "Project name",
    optional: "optional",
    brief: "Brief",
    questionnaireLanguage: "Questionnaire language",
    generate: "Generate best form",
    generating: "Generating...",
    save: "Save project",
    saving: "Saving...",
    preview: "Generated form preview",
    reviseTitle: "Ask Atpio to revise",
    reviseText:
      "Give high-level feedback and Atpio will update the current form. For precise field edits, save the project and open project detail.",
    reviseButton: "Revise with Atpio",
    revising: "Revising...",
    revisionPlaceholder:
      "Example: Add more price-sensitivity questions, reduce open-ended questions, and make the wording friendlier for students.",
  },
  zh: {
    projectNamePlaceholder: "可选。Atpio 可以帮你命名。",
    briefPlaceholder: "描述你想了解什么。我们会选择问题、字段类型、校验和布局。",
    projectCreator: "项目创建",
    allProjects: "所有项目",
    title: "把 research brief 变成反馈问卷。",
    subtitle:
      "描述你想收集的洞察。Atpio 会生成结构化问卷；这里用 AI 调整，保存后再进入项目详情细调字段。",
    projectName: "项目名称",
    optional: "可选",
    brief: "Brief",
    questionnaireLanguage: "问卷语言",
    generate: "生成最佳问卷",
    generating: "生成中...",
    save: "保存项目",
    saving: "保存中...",
    preview: "生成问卷预览",
    reviseTitle: "让 Atpio 调整",
    reviseText: "写下整体修改意见，Atpio 会更新当前问卷。精确字段编辑请保存后进入项目详情。",
    reviseButton: "用 Atpio 调整",
    revising: "调整中...",
    revisionPlaceholder: "例如：增加价格敏感度问题，减少开放题，让语气更适合学生。",
  },
} satisfies Record<UiLanguage, Record<string, string>>;
const emptyPreviewSchema: ProjectSchema = {
  title: "Your generated form will appear here",
  description:
    "Add a brief, then let Atpio design the best data-gathering flow.",
  fields: [],
};

type ProjectBuilderProps = {
  generatedFromUrl?: boolean;
  initialBrief?: string;
  initialName?: string;
  initialOutputLanguage?: "zh" | "en" | "bilingual";
  initialSchema?: ProjectSchema;
  initialSource?: "ppio" | "local";
  generationError?: string;
  savedProjectId?: string;
  uiLanguage?: UiLanguage;
};

export function ProjectBuilder({
  generatedFromUrl = false,
  initialBrief = "",
  initialName = "",
  initialOutputLanguage = "en",
  initialSchema = emptyPreviewSchema,
  generationError = "",
  savedProjectId,
  uiLanguage = "en",
}: ProjectBuilderProps) {
  const t = builderCopy[uiLanguage];
  const [brief, setBrief] = useState(initialBrief);
  const [name, setName] = useState(initialName);
  const [schema, setSchema] = useState<ProjectSchema>(initialSchema);
  const [outputLanguage, setOutputLanguage] = useState(initialOutputLanguage);
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [projectId, setProjectId] = useState(savedProjectId ?? "preview_project");
  const [status, setStatus] = useState<
    "idle" | "generating" | "revising" | "saving" | "saved"
  >(savedProjectId ? "saved" : "idle");
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState(generationError);
  const [sourceMessage, setSourceMessage] = useState(
    savedProjectId
      ? ""
      : generatedFromUrl
        ? "Form generated. Review the questions, then save it as a project."
        : "",
  );

  useEffect(() => {
    if (!showSavedToast) return;

    const timeout = window.setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [showSavedToast]);

  function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;

    if (submitter?.name === "intent" && submitter.value === "save") {
      void saveProject();
      return;
    }

    void generateSchema();
  }

  async function generateSchema() {
    const trimmedBrief = brief.trim();
    if (!trimmedBrief) {
      setErrorMessage("Add a brief before generating a schema.");
      setSourceMessage("");
      return;
    }

    setErrorMessage("");
    setSourceMessage(
      "Designing the best form, questions, field types, and validation.",
    );
    setStatus("generating");

    try {
      const response = await fetch("/api/projects/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmedBrief, outputLanguage }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Schema generation failed.");
      }

      const payload = await response.json();
      setName(payload.name);
      updateSchemaState(payload.schema);
      setSourceMessage(
        payload.source === "ppio"
          ? "Generated with PPIO. Review the questions, then save it as a project."
          : "Generated locally. Review the questions, then save it as a project.",
      );
      setStatus("idle");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not generate schema with PPIO.",
      );
      setStatus("idle");
    }
  }

  async function saveProject() {
    const trimmedBrief = brief.trim();
    if (!trimmedBrief) {
      setErrorMessage("Add a brief before saving the project.");
      setSourceMessage("");
      return;
    }

    setStatus("saving");
    setErrorMessage("");
    setSourceMessage("");
    try {
      const result = await createProjectAction({
        brief: trimmedBrief,
        name,
        outputLanguage,
        schema,
      });

      if (!result.project) throw new Error(result.error);

      setProjectId(result.project.id);
      updateSchemaState(result.project.schema);
      setStatus("saved");
      setShowSavedToast(true);
    } catch {
      setErrorMessage(
        "Could not save the project. Make sure the local Atpio server is running, then try again.",
      );
      setStatus("idle");
    }
  }

  async function reviseWithAi() {
    const trimmedBrief = brief.trim();
    const trimmedInstructions = revisionInstructions.trim();

    if (!trimmedBrief) {
      setErrorMessage("Add a brief before asking Atpio to revise the form.");
      setSourceMessage("");
      return;
    }

    if (!trimmedInstructions) {
      setErrorMessage("Add revision notes before asking Atpio to revise.");
      setSourceMessage("");
      return;
    }

    setErrorMessage("");
    setSourceMessage("Applying your revision notes to the current form.");
    setStatus("revising");

    try {
      const response = await fetch("/api/projects/revise-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: trimmedBrief,
          instructions: trimmedInstructions,
          outputLanguage,
          schema,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Schema revision failed.");
      }

      const payload = await response.json();
      setName(payload.name);
      updateSchemaState(payload.schema);
      setRevisionInstructions("");
      setSourceMessage("Revision applied. Review the changes, then save it.");
      setStatus("idle");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not revise schema with PPIO.",
      );
      setStatus("idle");
    }
  }

  function updateSchemaState(nextSchema: ProjectSchema) {
    setSchema(nextSchema);
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      {status === "generating" || status === "revising" || status === "saving" ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#f7f1e8]/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-7 text-center shadow-xl">
            <span
              aria-hidden="true"
              className="size-10 animate-spin rounded-full border-4 border-emerald-700 border-r-transparent"
            />
            <div>
              <p className="text-base font-semibold text-slate-950">
                {status === "generating"
                  ? "Designing your form"
                  : status === "revising"
                    ? "Revising your form"
                    : "Saving your project"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {status === "generating"
                  ? "Atpio is choosing the best questions, field types, validation, and layout."
                  : status === "revising"
                    ? "Atpio is applying your notes to the current questionnaire."
                    : "We are making this project available to the mock product."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {status === "saved" ? (
        <div
          className={[
            "fixed left-1/2 top-6 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-slate-950 shadow-xl transition-all duration-300",
            showSavedToast
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-6 opacity-0",
          ].join(" ")}
          role="status"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-semibold text-white"
            >
              OK
            </span>
            <div>
              <p className="font-semibold">Project saved successfully.</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                It is now available in All projects and will be used by the
                mock product at {publicMockProductUrl}.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <form
        action="/projects/new/save"
        className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur"
        method="post"
        onSubmit={handleProjectSubmit}
      >
        <textarea
          className="hidden"
          name="schema"
          readOnly
          value={JSON.stringify(schema)}
        />
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-emerald-700">
              {t.projectCreator}
            </p>
            <Link
              className="rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700"
              href="/projects"
            >
              {t.allProjects}
            </Link>
          </div>
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight">
            {t.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t.subtitle}
          </p>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-900">
            {t.projectName}{" "}
            <span className="font-normal text-slate-500">({t.optional})</span>
          </span>
          <input
            aria-label="Project name"
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 bg-white/90 px-3 text-sm outline-none focus:border-emerald-600"
            id="project-name"
            name="name"
            placeholder={t.projectNamePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-900">{t.brief}</span>
          <textarea
            aria-label="Brief"
            className="mt-2 min-h-40 w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            id="project-brief"
            name="brief"
            placeholder={t.briefPlaceholder}
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-900">
            {t.questionnaireLanguage}
          </span>
          <select
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 bg-white/90 px-3 text-sm outline-none focus:border-emerald-600"
            name="outputLanguage"
            value={outputLanguage}
            onChange={(event) =>
              setOutputLanguage(
                event.target.value === "zh" ||
                  event.target.value === "bilingual"
                  ? event.target.value
                  : "en",
              )
            }
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="bilingual">中文 + English</option>
          </select>
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 text-sm font-medium text-slate-800"
            disabled={
              status === "generating" ||
              status === "revising" ||
              status === "saving"
            }
            formAction="/projects/new"
            formMethod="get"
            name="generate"
            type="submit"
            value="1"
          >
            {status === "generating" ? (
              <>
                <Spinner />
                {t.generating}
              </>
            ) : (
              t.generate
            )}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white"
            disabled={status === "saving" || status === "revising"}
            name="intent"
            type="submit"
            value="save"
          >
            {status === "saving" ? (
              <>
                <Spinner />
                {t.saving}
              </>
            ) : (
              t.save
            )}
          </button>
        </div>

        {status === "generating" ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <Spinner />
            <span>
              Atpio is choosing the best questions, fields, validation, and
              layout. This can take a moment.
            </span>
          </div>
        ) : null}

        {sourceMessage ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {sourceMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {schema.fields.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {t.reviseTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {t.reviseText}
                </p>
              </div>
              <button
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-medium text-white disabled:opacity-50"
                disabled={status === "revising" || status === "saving"}
                onClick={reviseWithAi}
                type="button"
              >
                {status === "revising" ? (
                  <>
                    <Spinner />
                    {t.revising}
                  </>
                ) : (
                  t.reviseButton
                )}
              </button>
            </div>
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
              placeholder={t.revisionPlaceholder}
              value={revisionInstructions}
              onChange={(event) => setRevisionInstructions(event.target.value)}
            />
          </div>
        ) : null}

        {status === "saved" ? (
          <div
            className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900"
            role="status"
          >
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
              >
                OK
              </span>
              <div>
                <p className="font-semibold">Project saved successfully.</p>
                <p className="mt-1 text-emerald-800">
                  Open project detail to fine-tune fields, pages, validation,
                  and embed settings. The mock product can load it from{" "}
                  {publicMockProductUrl}.
                </p>
                <p className="mt-2 text-xs text-emerald-700">
                  Embed path: /embed/{projectId}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex h-9 items-center rounded-full bg-emerald-700 px-3 text-sm font-medium text-white"
                href={`/projects/${projectId}`}
              >
                Open project detail
              </Link>
              <a
                className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-800"
                href={publicMockProductUrl}
                rel="noreferrer"
                target="_blank"
              >
                Test in mock product
              </a>
              <Link
                className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-800"
                href="/projects"
              >
                View all projects
              </Link>
            </div>
          </div>
        ) : null}
      </form>

      <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <p className="mb-4 text-sm font-medium text-slate-500">
          {t.preview}
        </p>
        <DynamicForm projectId={projectId} previewMode schema={schema} />
      </section>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}
