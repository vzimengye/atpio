import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAdminResponse() {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
