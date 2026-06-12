import { publicAppUrl } from "@/lib/public-url";
import type { DataProject } from "@/lib/types";

function baseAttributes(project: DataProject) {
  const gadget = project.gadget;

  return [
    `data-atpio-position="${gadget.position}"`,
    `data-atpio-theme="${gadget.theme}"`,
    `data-atpio-label="${gadget.buttonLabel}"`,
    `data-atpio-brand-color="${gadget.brandColor}"`,
    `data-atpio-accent-color="${gadget.accentColor}"`,
    `data-atpio-button-shape="${gadget.buttonShape}"`,
    `data-atpio-font-family="${gadget.fontFamily}"`,
  ];
}

export function buildEmbedCode(project: DataProject) {
  return [
    `<script src="${publicAppUrl}/gadget.js"`,
    `data-project-id="${project.id}"`,
    ...baseAttributes(project),
    `></script>`,
  ].join(" ");
}

export function buildWorkspaceEmbedCode(project: DataProject, workspaceKey?: string) {
  if (!workspaceKey) return "";

  return [
    `<script src="${publicAppUrl}/gadget.js"`,
    `data-atpio-workspace-key="${workspaceKey}"`,
    ...baseAttributes(project),
    `></script>`,
  ].join(" ");
}
