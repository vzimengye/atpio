import { notFound } from "next/navigation";
import { ProjectDetailEditor } from "@/components/project-detail-editor";
import { getProject, listResponses } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <ProjectDetailEditor
        initialProject={project}
        responses={await listResponses(project.id)}
      />
    </main>
  );
}

