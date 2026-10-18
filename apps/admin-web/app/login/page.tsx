"use client";

import { CircleAlert, Droplets } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/");
        return;
      }
      setError(res.status === 401 ? "Wrong password. Try again." : "Something went wrong. Try again.");
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    }
    setPending(false);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <form
        onSubmit={signIn}
        className="flex w-full max-w-[380px] flex-col gap-5 rounded-[20px] bg-white p-7 shadow-[0_6px_20px_rgba(14,165,233,.10)]"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-sky-500 text-white">
            <Droplets size={17} aria-hidden />
          </div>
          <span className="text-lg font-extrabold">Skywash</span>
          <span className="text-[15px] text-slate-400">Operations</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-[23px] font-extrabold">Staff sign in</h1>
          <p className="text-sm text-slate-500">Enter the operations password to manage bookings.</p>
        </div>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
          Password
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[50px] rounded-[14px] border-[1.5px] border-slate-200 bg-white px-3.5 text-[15px] font-normal text-slate-900 outline-none focus:border-sky-500"
          />
        </label>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800"
          >
            <CircleAlert size={16} aria-hidden />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || !password}
          className="h-[50px] cursor-pointer rounded-[14px] bg-sky-500 text-[15px] font-bold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
