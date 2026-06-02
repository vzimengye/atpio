import { DynamicForm } from "@/components/dynamic-form";
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
  const project = (await getProject(projectId)) ?? sampleProject;
  const metadata = Object.fromEntries(
    Object.entries(query)
      .filter(([key]) => key.startsWith("meta_"))
      .map(([key, value]) => [
        key.replace(/^meta_/, ""),
        Array.isArray(value) ? value.join(",") : String(value ?? ""),
      ]),
  );

  return (
    <main
      className={
        project.gadget.theme === "dark"
          ? "min-h-screen bg-slate-950 p-4 text-slate-50"
          : "min-h-screen bg-white p-4 text-slate-950"
      }
    >
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-5 text-slate-950 shadow-sm">
        <p className="mb-4 text-xs font-medium uppercase text-slate-500">
          Embedded gadget preview: {projectId}
        </p>
        <DynamicForm
          compact
          metadata={metadata}
          projectId={projectId}
          schema={project.schema}
          successMessage={project.gadget.successMessage}
        />
      </div>
    </main>
  );
}
