import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";

async function login(formData: FormData) {
  "use server";

  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect("/login?error=credentials");
    }

    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect("/projects");
  }

  const hasError = Boolean(params.error);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f1e8] px-6 text-slate-950">
      <form
        action={login}
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white/85 p-6 shadow-sm"
      >
        <p className="text-sm font-medium text-emerald-700">Atpio workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in to manage projects, responses, and exports.
        </p>

        <label className="mt-6 block text-sm font-medium text-slate-900">
          Email
          <input
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 px-3 outline-none focus:border-emerald-600"
            name="email"
            required
            type="email"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-900">
          Password
          <input
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 px-3 outline-none focus:border-emerald-600"
            name="password"
            required
            type="password"
          />
        </label>

        {hasError ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            Could not sign in with those credentials.
          </p>
        ) : null}

        <button
          className="mt-6 h-10 w-full rounded-full bg-slate-950 text-sm font-medium text-white"
          type="submit"
        >
          Sign in
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          New to Atpio?{" "}
          <Link className="font-medium text-emerald-700" href="/register">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
