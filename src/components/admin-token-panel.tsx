"use client";

import { useState } from "react";

export function AdminTokenPanel() {
  const [token, setToken] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("atpioAdminToken") ?? "",
  );
  const [saved, setSaved] = useState(false);

  function saveToken() {
    if (token.trim()) {
      window.localStorage.setItem("atpioAdminToken", token.trim());
    } else {
      window.localStorage.removeItem("atpioAdminToken");
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-950">Admin token</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Required only when `ATPIO_ADMIN_TOKEN` is set on the server.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600"
          placeholder="x-atpio-admin-token"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
        <button
          className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
          onClick={saveToken}
          type="button"
        >
          Save
        </button>
      </div>
      {saved ? (
        <p className="mt-2 text-xs font-medium text-emerald-700">Saved</p>
      ) : null}
    </div>
  );
}
