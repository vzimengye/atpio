import { signOut } from "@/auth";

export function SignOutButton({ label = "Sign out" }: { label?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        className="rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}
