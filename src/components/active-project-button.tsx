"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveProjectAction } from "@/app/projects/actions";
import type { UiLanguage } from "@/lib/i18n";

export function ActiveProjectButton({
  isActive,
  projectId,
  uiLanguage = "en",
}: {
  isActive: boolean;
  projectId: string;
  uiLanguage?: UiLanguage;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t =
    uiLanguage === "zh"
      ? {
          active: "当前外部展示项目",
          setting: "设置中...",
          use: "设为外部展示",
        }
      : {
          active: "Active for external sites",
          setting: "Setting...",
          use: "Use on external sites",
        };

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
      {isActive ? t.active : isPending ? t.setting : t.use}
    </button>
  );
}
