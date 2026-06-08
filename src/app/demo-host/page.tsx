import Script from "next/script";
import { sampleProject } from "@/lib/mock-data";
import { publicAppUrl } from "@/lib/public-url";

export default function DemoHostPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
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
  src="${publicAppUrl}/gadget.js"
  data-project-id="${sampleProject.id}"
  data-atpio-position="bottom-right"
  data-atpio-theme="light"
  data-atpio-label="Share feedback"
  data-atpio-meta-page="demo-host"
  data-atpio-meta-user-segment="trial"
  data-atpio-meta-experiment-id="onboarding-v1"
  data-atpio-success-callback="onAtpioSuccess">
</script>`}
        </pre>
      </section>
      <Script id="atpio-demo-events">
        {`
          window.onAtpioSuccess = function (detail) {
            console.log("Atpio success callback", detail);
          };
          window.addEventListener("atpio:open", function (event) {
            console.log("Atpio opened", event.detail);
          });
          window.addEventListener("atpio:close", function (event) {
            console.log("Atpio closed", event.detail);
          });
          window.addEventListener("atpio:success", function (event) {
            console.log("Atpio success event", event.detail);
          });
        `}
      </Script>
      <Script
        src="/gadget.js"
        data-atpio-label="Share feedback"
        data-atpio-meta-experiment-id="onboarding-v1"
        data-atpio-meta-page="demo-host"
        data-atpio-meta-user-segment="trial"
        data-atpio-position="bottom-right"
        data-atpio-success-callback="onAtpioSuccess"
        data-atpio-theme="light"
        data-project-id={sampleProject.id}
      />
    </main>
  );
}

