"use client";
import { ReactNode, useEffect } from "react";
// Removed DefaultSeo import because next-seo config file missing; can be re-added when config exists

interface Props {
  children: ReactNode;
}

// Handles initial theme (no-flash) after hydration
function useThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, []);
}

export function Providers({ children }: Props) {
  useThemeInit();
  return <>{children}</>;
}

export default Providers;
