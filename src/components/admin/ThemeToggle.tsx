"use client";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      root.classList.add("light");
      setLight(true);
    } else {
      // Default to dark theme
      root.classList.remove("light");
      setLight(false);
      localStorage.setItem("theme", "dark");
    }
  }, []);
  const toggle = () => {
    const root = document.documentElement;
    if (root.classList.contains("light")) {
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setLight(false);
    } else {
      root.classList.add("light");
      localStorage.setItem("theme", "light");
      setLight(true);
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
            light
              ? "bg-slate-400 scale-75 opacity-80"
              : "bg-sky-400 scale-100 opacity-100"
          }`}
        ></span>
      </span>
      {light ? "Light" : "Dark"}
    </button>
  );
}
