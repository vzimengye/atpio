import type { DataProject } from "@/lib/types";

function normalizeHost(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export function isOriginAllowed(project: DataProject, request: Request) {
  const allowedDomains = project.gadget.allowedDomains ?? [];
  if (allowedDomains.length === 0) return true;

  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!source) return false;

  let host = "";
  try {
    host = new URL(source).host.toLowerCase();
  } catch {
    host = normalizeHost(source);
  }

  return allowedDomains
    .map(normalizeHost)
    .filter(Boolean)
    .some((allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`));
}

export function forbiddenOriginResponse(headers?: HeadersInit) {
  return Response.json(
    { error: "This project is not available from this domain." },
    { headers, status: 403 },
  );
}
