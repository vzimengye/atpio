import { redirect } from "next/navigation";
import { SchemaGenerationError } from "@/ai/generate-schema";
import { auth } from "@/auth";
import { ProjectBuilder } from "@/components/project-builder";
import { getUiLanguage } from "@/lib/i18n";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";

type NewProjectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function questionnaireLanguage(value: string | string[] | undefined) {
  const raw = firstParam(value);
  return raw === "zh" || raw === "bilingual" ? raw : "en";
}

export default async function NewProjectPage({
  searchParams,
}: NewProjectPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const uiLanguage = getUiLanguage(params.lang);
  const brief = firstParam(params.brief);
  const outputLanguage = questionnaireLanguage(params.outputLanguage);
  const generated = firstParam(params.generate) === "1" && brief;
  let aiResult;
  let generationError: string | undefined;
  if (generated) {
    try {
      aiResult = await generateSchemaWithPpio(brief, outputLanguage);
    } catch (error) {
      generationError =
        error instanceof SchemaGenerationError
          ? error.message
          : "Could not generate schema with PPIO.";
    }
  }
  const initialBrief = brief ?? undefined;
  const initialName = firstParam(params.name) ?? undefined;
  const savedProjectId = firstParam(params.saved) ?? undefined;

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <ProjectBuilder
        generatedFromUrl={Boolean(generated)}
        initialBrief={initialBrief}
        initialName={aiResult?.name ?? initialName}
        initialSchema={aiResult?.schema}
        initialSource={aiResult?.source}
        initialOutputLanguage={outputLanguage}
        uiLanguage={uiLanguage}
        generationError={generationError}
        savedProjectId={savedProjectId}
      />
    </main>
  );
}
