"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Container from "./Container";
import cn from "classnames";

// Simple theme toggle component inline
function ThemeToggle({ scrolled = false }: { scrolled?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme =
        (localStorage.getItem("theme") as "light" | "dark") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-10 w-10 rounded-xl border transition-all duration-300",
          scrolled
            ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            : "bg-white/20 border-white/30 backdrop-blur-sm"
        )}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "h-10 w-10 inline-flex items-center justify-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200 group",
        scrolled
          ? "bg-gray-100 hover:bg-sky-100 dark:bg-gray-800 dark:hover:bg-sky-900/20 border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600"
          : "bg-white/20 hover:bg-white/30 border-white/30 hover:border-white/50 backdrop-blur-sm"
      )}
    >
      {theme === "dark" ? (
        <svg
          className={cn(
            "h-5 w-5 group-hover:text-amber-400 transition-colors",
            scrolled ? "text-amber-500" : "text-amber-300"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M6.34 17.66l1.41-1.41M16.24 8.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          className={cn(
            "h-5 w-5 group-hover:text-sky-500 transition-colors",
            scrolled ? "text-sky-600" : "text-white"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 12 17a7 7 0 0 0 9-4.21Z" />
        </svg>
      )}
    </button>
  );
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/blog", label: "Blog" },
  { href: "/events", label: "Events" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false); // close on route change
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/80 dark:border-gray-700/80"
          : "bg-transparent"
      )}
    >
      <Container className="flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            href="/"
            className="group flex items-center gap-4 hover:scale-[1.02] transition-transform duration-200"
          >
            {/* Islamic inspired logo with dual theme */}
            <div
              className={cn(
                "relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-sky-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-emerald-200/50 dark:ring-emerald-400/30 transition-all duration-300",
                !scrolled && "ring-white/30 dark:ring-white/20"
              )}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V16L8 18V21H16V18L13 16V11C14.1 11 15 10.1 15 9H21Z" />
              </svg>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-sky-500 dark:from-emerald-400 dark:to-sky-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-bold text-xl transition-colors duration-300",
                  scrolled
                    ? "text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                    : "text-white group-hover:text-emerald-200"
                )}
              >
                Pesantren
              </span>
              <span
                className={cn(
                  "text-xs font-medium -mt-1 transition-colors duration-300",
                  scrolled
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-white/80"
                )}
              >
                Modern & Islami
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-3 rounded-xl transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 relative overflow-hidden",
                    active
                      ? scrolled
                        ? "text-emerald-700 dark:text-emerald-300 bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/30 dark:to-sky-900/30 shadow-sm border border-emerald-100 dark:border-emerald-700/30"
                        : "text-white bg-white/20 backdrop-blur-sm border border-white/30"
                      : scrolled
                      ? "text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-sky-50/50 dark:hover:from-emerald-900/20 dark:hover:to-sky-900/20"
                      : "text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                  )}
                >
                  {active && scrolled && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-sky-500 dark:from-emerald-400 dark:to-sky-400 rounded-full"></div>
                  )}
                  {active && !scrolled && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle scrolled={scrolled} />
          <Link
            href="/donate"
            className="hidden sm:inline-flex px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 dark:from-emerald-400 dark:to-sky-500 dark:hover:from-emerald-500 dark:hover:to-sky-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Donasi
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] hover:border-sky-400/60 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50/60 dark:bg-[hsl(var(--surface-alt))] dark:hover:bg-sky-900/40 transition-colors"
          >
            <span className="sr-only">Menu</span>
            <div className="relative h-5 w-5">
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-0.5 bg-current rounded-full transition-all",
                  open && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-2.5 h-0.5 bg-current rounded-full transition-all",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-5 h-0.5 bg-current rounded-full transition-all",
                  open && "-translate-y-2 -rotate-45"
                )}
              />
            </div>
          </button>
        </div>
      </Container>
      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          "lg:hidden fixed inset-y-0 right-0 w-80 max-w-full z-50 transform transition-transform duration-300 will-change-transform shadow-2xl",
          "backdrop-blur-xl bg-white/90 dark:bg-[hsl(var(--surface)/0.92)] border-l border-[hsl(var(--border))]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-[hsl(var(--divider))]">
          <span className="font-bold text-lg text-[hsl(var(--foreground))]">
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-sky-50/70 dark:hover:bg-sky-900/40 transition-colors"
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col px-4 py-6 gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                  active
                    ? "text-sky-700 dark:text-sky-300 bg-sky-50/90 dark:bg-sky-900/40"
                    : "text-[hsl(var(--foreground-soft))] hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50/70 dark:hover:bg-sky-900/30"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="px-4 pt-6 border-t border-[hsl(var(--divider))] mt-4">
            <p className="text-xs uppercase tracking-wide font-bold text-[hsl(var(--foreground-muted))] mb-3">
              Settings
            </p>
            <ThemeToggle />
          </div>
        </nav>
      </div>
      {/* Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}
    </header>
  );
}

export default Navbar;
