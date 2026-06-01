import { DynamicForm } from "@/components/dynamic-form";
import { sampleProject } from "@/lib/mock-data";

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-emerald-700">
            Project creator
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Turn a research brief into a collection form.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page is the first builder stub. The next step is to call an LLM
            to generate the schema from the brief instead of loading mock data.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-slate-900">Brief</span>
            <textarea
              className="mt-2 min-h-40 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              defaultValue={sampleProject.brief}
            />
          </label>

          <button className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white">
            Generate schema
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="mb-4 text-sm font-medium text-slate-500">
            Generated form preview
          </p>
          <DynamicForm
            projectId={sampleProject.id}
            schema={sampleProject.schema}
          />
        </section>
      </div>
    </main>
  );
}

