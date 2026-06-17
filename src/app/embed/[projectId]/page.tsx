import { DynamicForm } from "@/components/dynamic-form";
import { getUiLanguageFromParams } from "@/lib/i18n";
import { sampleProject } from "@/lib/mock-data";
import { getProject } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId } = await params;
  const query = await searchParams;
  const uiLanguage = getUiLanguageFromParams(query);
  const project = (await getProject(projectId)) ?? sampleProject;
  const metadata = Object.fromEntries(
    Object.entries(query)
      .filter(([key]) => key.startsWith("meta_"))
      .map(([key, value]) => [
        key.replace(/^meta_/, ""),
        Array.isArray(value) ? value.join(",") : String(value ?? ""),
      ]),
  );
  const isDark = project.gadget.theme === "dark";
  const background =
    project.gadget.backgroundColor ?? (isDark ? "#020617" : "#f8fafc");
  const textColor = project.gadget.textColor ?? (isDark ? "#f8fafc" : "#020617");
  const borderColor = project.gadget.borderColor ?? (isDark ? "#334155" : "#dbe3ef");
  const shadow =
    project.gadget.shadow === "none"
      ? "none"
      : project.gadget.shadow === "strong"
        ? "0 28px 80px rgba(15, 23, 42, 0.26)"
        : "0 18px 50px rgba(15, 23, 42, 0.12)";

  return (
    <main
      className="min-h-screen p-4"
      style={{
        background,
        color: textColor,
        fontFamily: project.gadget.fontFamily,
      }}
    >
      <div
        className="mx-auto max-w-xl rounded-3xl border p-4"
        style={{
          background,
          borderColor,
          boxShadow: shadow,
          color: textColor,
        }}
      >
        <p className="mb-4 text-xs font-medium uppercase opacity-60">
          Embedded gadget preview: {projectId}
        </p>
        <DynamicForm
          compact
          gadget={project.gadget}
          metadata={metadata}
          projectId={projectId}
          schema={project.schema}
          successMessage={project.gadget.successMessage}
          uiLanguage={uiLanguage}
        />
      </div>
    </main>
  );
}
