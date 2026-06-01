import "server-only";

import { NextResponse } from "next/server";
import { addAuditEvent } from "./store";

export async function requireAdmin(request: Request) {
  const adminToken = process.env.ATPIO_ADMIN_TOKEN;

  if (!adminToken) {
    return null;
  }

  const providedToken = request.headers.get("x-atpio-admin-token");
  if (providedToken === adminToken) {
    return null;
  }

  await addAuditEvent({
    action: "auth.denied",
    actor: "system",
    metadata: { path: new URL(request.url).pathname },
  });

  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

