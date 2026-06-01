import { DynamicForm } from "@/components/dynamic-form";
import { sampleProject } from "@/lib/mock-data";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-white p-4 text-slate-950">
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 p-5 shadow-sm">
        <p className="mb-4 text-xs font-medium uppercase text-slate-500">
          Embedded gadget preview: {projectId}
        </p>
        <DynamicForm
          compact
          projectId={projectId}
          schema={sampleProject.schema}
        />
      </div>
    </main>
  );
}

