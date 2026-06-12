import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProjectDetailEditor } from "@/components/project-detail-editor";
import { getUiLanguageFromParams, langPath } from "@/lib/i18n";
import { getProject, getUserByEmail, listResponses } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const lang = getUiLanguageFromParams(query);
  const session = await auth();
  if (!session?.user) redirect(langPath("/login", lang));

  const { projectId } = await params;
  const ownerEmail = session.user.email ?? undefined;
  const [project, account] = await Promise.all([
    getProject(projectId, ownerEmail),
    ownerEmail ? getUserByEmail(ownerEmail) : null,
  ]);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f1e8] text-slate-950">
      <ProjectDetailEditor
        activeProjectId={account?.activeProjectId}
        initialProject={project}
        responses={await listResponses(project.id)}
        uiLanguage={lang}
        workspaceKey={account?.publicKey}
      />
    </main>
  );
}
