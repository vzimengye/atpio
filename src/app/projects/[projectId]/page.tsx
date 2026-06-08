import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProjectDetailEditor } from "@/components/project-detail-editor";
import { getProject, listResponses } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { projectId } = await params;
  const project = await getProject(projectId, session.user.email ?? undefined);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f1e8] text-slate-950">
      <ProjectDetailEditor
        initialProject={project}
        responses={await listResponses(project.id)}
      />
    </main>
  );
}
