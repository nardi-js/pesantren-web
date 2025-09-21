import { ThemeToggle } from "@/components/admin/ThemeToggle";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 text-slate-800 dark:text-slate-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">
            Admin Login
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            UI only. No authentication wired.
          </p>
        </div>
        <form className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-6 shadow">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>
          <div className="text-[11px] text-red-500 h-3">
            {/* error placeholder */}
          </div>
          <button
            type="button"
            className="w-full rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 transition"
          >
            Sign In
          </button>
        </form>
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/admin"
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            Skip to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
