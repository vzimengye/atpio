export type UiLanguage = "en" | "zh";
export type OutputLanguage = UiLanguage | "bilingual";

export function getUiLanguage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "zh" || raw?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function langPath(path: string, lang: UiLanguage) {
  return lang === "zh" ? `${path}${path.includes("?") ? "&" : "?"}lang=zh` : path;
}

export function getUiLanguageFromParams(
  params: Record<string, string | string[] | undefined>,
) {
  return getUiLanguage(params.lang ?? params.language ?? params.locale);
}

export function getOutputLanguage(
  value?: string | string[],
  fallback: UiLanguage = "en",
): OutputLanguage {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "bilingual") return "bilingual";
  if (raw === "zh" || raw?.toLowerCase().startsWith("zh")) return "zh";
  if (raw === "en" || raw?.toLowerCase().startsWith("en")) return "en";
  return fallback;
}
