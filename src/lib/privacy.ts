const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const urlPattern = /https?:\/\/[^\s]+/gi;

export function redactSensitiveText(value: string) {
  return value
    .replace(emailPattern, "[redacted-email]")
    .replace(phonePattern, "[redacted-phone]")
    .replace(urlPattern, "[redacted-url]");
}

export function renderAnswersForAnalysis(
  answers: Record<string, string | string[] | boolean>,
) {
  return Object.entries(answers)
    .map(([key, value]) => {
      const rendered = Array.isArray(value) ? value.join(", ") : String(value);
      return `${key}: ${redactSensitiveText(rendered)}`;
    })
    .join("\n");
}

