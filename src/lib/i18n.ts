export type UiLanguage = "en" | "zh";

export function getUiLanguage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "zh" ? "zh" : "en";
}

export function langPath(path: string, lang: UiLanguage) {
  return lang === "zh" ? `${path}${path.includes("?") ? "&" : "?"}lang=zh` : path;
}
