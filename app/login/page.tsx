import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form action={loginAction} className="w-full space-y-4 rounded-xl border p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Attendance System Login</h1>
          <p className="text-sm text-zinc-600">Use internal credentials to continue.</p>
        </div>

        {hasError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid username or password.
          </p>
        ) : null}

        <label className="block space-y-1 text-sm">
          <span>Username</span>
          <input
            name="username"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="admin"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-700"
        >
          Login
        </button>
      </form>
    </main>
  );
}
