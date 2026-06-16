import { publicAppUrl } from "@/lib/public-url";
import type { DataProject, FormField } from "@/lib/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fieldHtml(field: FormField) {
  const required = field.required ? " required" : "";
  const label = `<label class="field-label" for="${escapeHtml(field.id)}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label>`;
  const placeholder = field.placeholder
    ? ` placeholder="${escapeHtml(field.placeholder)}"`
    : "";

  if (field.type === "long_text") {
    return `<div class="field">${label}<textarea id="${escapeHtml(field.id)}" name="${escapeHtml(field.id)}"${placeholder}${required}></textarea></div>`;
  }

  if (field.type === "single_select") {
    return `<div class="field">${label}<select id="${escapeHtml(field.id)}" name="${escapeHtml(field.id)}"${required}><option value="">Select one</option>${(field.options ?? [])
      .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
      .join("")}</select></div>`;
  }

  if (field.type === "multi_select") {
    return `<fieldset class="field"><legend>${escapeHtml(field.label)}${field.required ? " *" : ""}</legend><div class="chips">${(field.options ?? [])
      .map(
        (option) =>
          `<label class="chip"><input type="checkbox" name="${escapeHtml(field.id)}" value="${escapeHtml(option)}"> ${escapeHtml(option)}</label>`,
      )
      .join("")}</div></fieldset>`;
  }

  if (field.type === "rating") {
    return `<fieldset class="field"><legend>${escapeHtml(field.label)}${field.required ? " *" : ""}</legend><div class="rating">${[1, 2, 3, 4, 5]
      .map(
        (rating) =>
          `<label><input type="radio" name="${escapeHtml(field.id)}" value="${rating}"${field.required ? " required" : ""}> ${rating}</label>`,
      )
      .join("")}</div></fieldset>`;
  }

  if (field.type === "boolean") {
    return `<label class="field checkbox"><input id="${escapeHtml(field.id)}" name="${escapeHtml(field.id)}" type="checkbox"> ${escapeHtml(field.label)}</label>`;
  }

  return `<div class="field">${label}<input id="${escapeHtml(field.id)}" name="${escapeHtml(field.id)}" type="text"${placeholder}${required}></div>`;
}

export function renderStandaloneHtml(project: DataProject) {
  const gadget = project.gadget;
  const isDark = gadget.theme === "dark";
  const background = gadget.backgroundColor ?? (isDark ? "#020617" : "#f8fafc");
  const surface = gadget.backgroundColor ?? (isDark ? "#020617" : "#ffffff");
  const text = gadget.textColor ?? (isDark ? "#f8fafc" : "#020617");
  const border = gadget.borderColor ?? (isDark ? "#334155" : "#dbe3ef");
  const accent = gadget.accentColor;
  const brand = gadget.brandColor;
  const radius =
    gadget.buttonShape === "square"
      ? "6px"
      : gadget.buttonShape === "rounded"
        ? "12px"
        : "999px";
  const shadow =
    gadget.shadow === "none"
      ? "none"
      : gadget.shadow === "strong"
        ? "0 28px 80px rgba(15,23,42,.24)"
        : "0 18px 50px rgba(15,23,42,.12)";
  const padding =
    gadget.density === "compact"
      ? "20px"
      : gadget.density === "spacious"
        ? "36px"
        : "28px";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(project.schema.title)}</title>
  <style>
    :root {
      color-scheme: ${isDark ? "dark" : "light"};
      --background: ${background};
      --surface: ${surface};
      --text: ${text};
      --muted: ${isDark ? "#94a3b8" : "#64748b"};
      --border: ${border};
      --accent: ${accent};
      --brand: ${brand};
      --radius: ${radius};
      --shadow: ${shadow};
      --font: ${gadget.fontFamily};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 14%, transparent), transparent 30%), var(--background);
      color: var(--text);
      font-family: var(--font);
      padding: 24px;
    }
    main {
      width: min(720px, 100%);
      border: 1px solid var(--border);
      border-radius: 28px;
      background: var(--surface);
      box-shadow: var(--shadow);
      padding: ${padding};
    }
    h1 { margin: 0; font-size: clamp(28px, 5vw, 44px); line-height: 1.05; }
    p { color: var(--muted); line-height: 1.7; }
    form { display: grid; gap: 18px; margin-top: 28px; }
    .field { display: grid; gap: 8px; border: 0; padding: 0; margin: 0; }
    .field-label, legend { font-weight: 650; }
    input, select, textarea {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: transparent;
      color: var(--text);
      font: inherit;
      padding: 12px 14px;
    }
    textarea { min-height: 120px; resize: vertical; }
    .chips, .rating { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip, .rating label {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 10px 12px;
      cursor: pointer;
    }
    .checkbox {
      display: flex;
      grid-template-columns: auto 1fr;
      align-items: center;
    }
    .checkbox input { width: auto; }
    button {
      justify-self: start;
      border: 1px solid var(--brand);
      border-radius: var(--radius);
      background: var(--brand);
      color: ${isDark ? "#020617" : "#ffffff"};
      font: inherit;
      font-weight: 700;
      padding: 12px 18px;
      cursor: pointer;
    }
    #message { margin-top: 16px; color: var(--accent); font-weight: 650; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(project.schema.title)}</h1>
    <p>${escapeHtml(project.schema.description)}</p>
    <form id="atpio-form">
      ${project.schema.fields.map(fieldHtml).join("\n      ")}
      <button type="submit">${escapeHtml(project.gadget.buttonLabel || "Submit feedback")}</button>
    </form>
    <div id="message" role="status"></div>
  </main>
  <script>
    const form = document.getElementById("atpio-form");
    const message = document.getElementById("message");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const answers = {};
      for (const [key, value] of data.entries()) {
        if (answers[key]) {
          answers[key] = Array.isArray(answers[key]) ? [...answers[key], value] : [answers[key], value];
        } else {
          answers[key] = value;
        }
      }
      form.querySelectorAll("input[type='checkbox']").forEach((input) => {
        if (!answers[input.name]) answers[input.name] = input.checked;
      });
      const response = await fetch("${publicAppUrl}/api/projects/${encodeURIComponent(project.id)}/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, metadata: { source: "standalone_html" } })
      });
      if (!response.ok) {
        message.textContent = "Could not submit feedback.";
        return;
      }
      form.reset();
      message.textContent = ${JSON.stringify(project.gadget.successMessage)};
    });
  </script>
</body>
</html>`;
}
