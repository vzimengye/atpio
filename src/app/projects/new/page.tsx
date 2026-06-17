import { redirect } from "next/navigation";
import { SchemaGenerationError } from "@/ai/generate-schema";
import { auth } from "@/auth";
import { ProjectBuilder } from "@/components/project-builder";
import { getOutputLanguage, getUiLanguageFromParams } from "@/lib/i18n";
import { generateSchemaWithPpio } from "@/lib/ppio-schema";

type NewProjectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewProjectPage({
  searchParams,
}: NewProjectPageProps) {
  const params = await searchParams;
  const uiLanguage = getUiLanguageFromParams(params);
  const session = await auth();
  if (!session?.user) redirect(uiLanguage === "zh" ? "/login?lang=zh" : "/login");

  const brief = firstParam(params.brief);
  const outputLanguage = getOutputLanguage(
    params.outputLanguage ?? params.questionnaireLanguage ?? params.language,
    uiLanguage,
  );
  const generated = firstParam(params.generate) === "1" && brief;
  let aiResult;
  let generationError: string | undefined;
  if (generated) {
    try {
      aiResult = await generateSchemaWithPpio(brief, outputLanguage);
    } catch (error) {
      generationError =
        uiLanguage === "zh"
          ? "Atpio 暂时无法生成问卷。请稍后再试。"
          : error instanceof SchemaGenerationError
            ? error.message
            : "Atpio could not generate the form right now.";
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
