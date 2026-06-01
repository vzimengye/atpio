"use client";

import { useState } from "react";
import { getAdminHeaders } from "@/lib/admin-client";

export function AnalyzeButton({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");

  async function runAnalysis() {
    setStatus("running");
    await fetch(`/api/projects/${projectId}/analyze`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    setStatus("done");
    window.location.reload();
  }

  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      disabled={status === "running"}
      onClick={runAnalysis}
    >
      {status === "running" ? "Analyzing..." : "Analyze responses"}
    </button>
  );
}
