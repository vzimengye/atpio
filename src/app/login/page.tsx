import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { getUiLanguageFromParams, langPath } from "@/lib/i18n";

async function login(formData: FormData) {
  "use server";

  try {
    const lang = String(formData.get("lang") ?? "en") === "zh" ? "zh" : "en";
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: langPath("/", lang),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const lang = String(formData.get("lang") ?? "en") === "zh" ? "zh" : "en";
      const path =
        lang === "zh"
          ? "/login?lang=zh&error=credentials"
          : "/login?error=credentials";
      return redirect(path);
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
  const lang = getUiLanguageFromParams(params);

  if (session?.user) {
    redirect(langPath("/", lang));
  }

  const hasError = Boolean(params.error);
  const registered = Boolean(params.registered);
  const isZh = lang === "zh";

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f1e8] px-6 text-slate-950">
      <form
        action={login}
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white/85 p-6 shadow-sm"
      >
        <input name="lang" type="hidden" value={lang} />
        <p className="text-sm font-medium text-emerald-700">
          {isZh ? "Atpio 账号" : "Atpio account"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {isZh ? "登录" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isZh
            ? "登录后可以创建反馈项目、选择要展示到外部产品里的问卷，并查看收集到的回答。填写问卷的普通用户不需要账号。"
            : "Sign in to create projects, choose the active embedded form, and review responses. Feedback participants never need an account."}
        </p>

        <label className="mt-6 block text-sm font-medium text-slate-900">
          {isZh ? "邮箱" : "Email"}
          <input
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 px-3 outline-none focus:border-emerald-600"
            name="email"
            required
            type="email"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-900">
          {isZh ? "密码" : "Password"}
          <input
            className="mt-2 h-10 w-full rounded-xl border border-stone-300 px-3 outline-none focus:border-emerald-600"
            name="password"
            required
            type="password"
          />
        </label>

        {hasError ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {isZh ? "邮箱或密码不正确。" : "Could not sign in with those credentials."}
          </p>
        ) : null}
        {registered ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {isZh ? "账号已创建。登录后进入首页。" : "Account created. Sign in to open the homepage."}
          </p>
        ) : null}

        <button
          className="mt-6 h-10 w-full rounded-full bg-slate-950 text-sm font-medium text-white"
          type="submit"
        >
          {isZh ? "登录" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          {isZh ? "还没有 Atpio 账号？" : "New to Atpio?"}{" "}
          <Link className="font-medium text-emerald-700" href={langPath("/register", lang)}>
            {isZh ? "注册" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
}
