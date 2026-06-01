import Script from "next/script";
import { sampleProject } from "@/lib/mock-data";

export default function DemoHostPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-medium text-emerald-700">
          Mock host product
        </p>
        <h1 className="mt-2 text-4xl font-semibold">
          This page simulates another product using Atpio.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          The feedback button in the bottom-right corner is mounted by
          `/gadget.js`, the same integration path another product would use.
        </p>
        <pre className="mt-8 overflow-x-auto rounded-lg bg-slate-950 p-5 text-sm leading-6 text-white">
          {`<script
  src="http://127.0.0.1:3000/gadget.js"
  data-project-id="${sampleProject.id}">
</script>`}
        </pre>
      </section>
      <Script src="/gadget.js" data-project-id={sampleProject.id} />
    </main>
  );
}

