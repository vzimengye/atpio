import { signOut } from "@/auth";

export function SignOutButton({
  className = "rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700",
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form
      className="contents"
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        className={className}
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}
