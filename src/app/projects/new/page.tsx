import { ProjectBuilder } from "@/components/project-builder";
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
  const brief = firstParam(params.brief);
  const generated = firstParam(params.generate) === "1" && brief;
  const aiResult = generated ? await generateSchemaWithPpio(brief) : undefined;
  const initialBrief = brief ?? undefined;
  const initialName = firstParam(params.name) ?? undefined;

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <ProjectBuilder
        generatedFromUrl={Boolean(generated)}
        initialBrief={initialBrief}
        initialName={aiResult?.name ?? initialName}
        initialSchema={aiResult?.schema}
        initialSource={aiResult?.source}
      />
    </main>
  );
}
