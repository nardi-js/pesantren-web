"use client";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
      setDark(true);
    }
  }, []);
  const toggle = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`inline-flex items-center gap-2 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-white/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition ${className}`}
    >
      <span className="relative flex h-3 w-3">
        <span
          className={`absolute inset-0 rounded-full transition-all ${
            dark
              ? "bg-sky-400 scale-100 opacity-100"
              : "bg-slate-400 scale-75 opacity-80"
          }`}
        ></span>
      </span>
      {dark ? "Dark" : "Light"}
    </button>
  );
}
