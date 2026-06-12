"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveProjectAction } from "@/app/projects/actions";

export function ActiveProjectButton({
  isActive,
  projectId,
}: {
  isActive: boolean;
  projectId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "border border-stone-300 bg-white/80 text-slate-700"
      }`}
      disabled={isActive || isPending}
      onClick={(event) => {
        event.preventDefault();
        startTransition(async () => {
          await setActiveProjectAction(projectId);
          router.refresh();
        });
      }}
      type="button"
    >
      {isActive ? "Active in embeds" : isPending ? "Setting..." : "Use in embeds"}
    </button>
  );
}
