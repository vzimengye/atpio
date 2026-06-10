import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { createUser } from "@/lib/store";
import { registerUserSchema } from "@/lib/validation";

async function register(formData: FormData) {
  "use server";

  const parsed = registerUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/register?error=invalid");
  }

  try {
    await createUser(parsed.data);
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/projects",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/register?error=signin");
    }

    if (error instanceof Error && error.message === "email_exists") {
      redirect("/register?error=exists");
    }

    throw error;
  }
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect("/projects");
  }

  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f1e8] px-6 text-slate-950">
      <form
        action={register}
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white/85 p-6 shadow-sm"
      >
        <p className="text-sm font-medium text-emerald-700">Atpio workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">Create an account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Register to keep your projects, forms, and response records separate
          from other users.
        </p>

        <label className="mt-6 block text-sm font-medium text-slate-900">
          Name <span className="font-normal text-slate-500">(optional)</span>
          <input
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 px-3 outline-none focus:border-emerald-600"
            name="name"
            type="text"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-900">
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
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error === "exists"
              ? "An account with this email already exists."
              : error === "invalid"
                ? "Use a valid email and a password of at least 8 characters."
                : "Could not create the account. Try signing in."}
          </p>
        ) : null}

        <button
          className="mt-6 h-10 w-full rounded-full bg-slate-950 text-sm font-medium text-white"
          type="submit"
        >
          Create account
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-emerald-700" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
