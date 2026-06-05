import { ProjectBuilder } from "@/components/project-builder";
import { generateSchemaFromBrief, projectNameFromBrief } from "@/lib/schema-generator";

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
  const initialBrief = brief ?? undefined;
  const initialName = firstParam(params.name) ?? undefined;
  const initialSchema = generated ? generateSchemaFromBrief(brief) : undefined;

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <ProjectBuilder
        generatedFromUrl={Boolean(generated)}
        initialBrief={initialBrief}
        initialName={
          generated ? projectNameFromBrief(brief) : initialName
        }
        initialSchema={initialSchema}
      />
    </main>
  );
}
