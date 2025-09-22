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
    const theme = stored || "dark"; // Default to dark theme
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
    // Ensure localStorage is set
    if (!stored) {
      localStorage.setItem("theme", "dark");
    }
  }, []);
}

export function Providers({ children }: Props) {
  useThemeInit();
  return <>{children}</>;
}

export default Providers;
