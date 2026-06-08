import { publicAppUrl } from "@/lib/public-url";
import type { DataProject } from "@/lib/types";

export function buildEmbedCode(project: DataProject) {
  const gadget = project.gadget;

  return [
    `<script src="${publicAppUrl}/gadget.js"`,
    `data-project-id="${project.id}"`,
    `data-atpio-position="${gadget.position}"`,
    `data-atpio-theme="${gadget.theme}"`,
    `data-atpio-label="${gadget.buttonLabel}"`,
    `data-atpio-brand-color="${gadget.brandColor}"`,
    `data-atpio-accent-color="${gadget.accentColor}"`,
    `data-atpio-button-shape="${gadget.buttonShape}"`,
    `data-atpio-font-family="${gadget.fontFamily}"></script>`,
  ].join(" ");
}
