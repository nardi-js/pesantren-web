"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarId = "admin-sidebar";
  const pathname = usePathname();
  const derivedTitle =
    title ||
    (pathname === "/admin"
      ? "Dashboard"
      : pathname.replace("/admin/", "").replace(/-/g, " "));
  const closeAction = useCallback(() => {
    setOpen(false);
    // Return focus to menu button after closing sidebar (mobile accessibility)
    setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 0);
  }, []);
  const toggleCollapseAction = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("adminSidebarCollapsed", next ? "1" : "0");
      return next;
    });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("adminSidebarCollapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  const breadcrumbs = useMemo(() => {
    if (pathname === "/admin") return [];
    const parts = pathname
      .replace(/^\/admin\/?/, "")
      .split("/")
      .filter(Boolean);
    return parts.map((p, i) => ({
      label: p.replace(/-/g, " "),
      href: "/admin/" + parts.slice(0, i + 1).join("/"),
    }));
  }, [pathname]);
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100">
      {/* Skip link for keyboard users */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-sky-600 focus:text-white text-sm font-medium"
      >
        Skip to main content
      </a>
      <Sidebar
        open={open}
        onCloseAction={closeAction}
        title={derivedTitle}
        collapsed={collapsed}
        onToggleCollapseAction={toggleCollapseAction}
      />
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Hamburger */}
        <header className="lg:hidden bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              ref={menuButtonRef}
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label={
                open ? "Close navigation menu" : "Open navigation menu"
              }
              aria-haspopup="true"
              aria-expanded="false"
              aria-controls={sidebarId}
            >
              {open ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
            <h1 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
              {derivedTitle}
            </h1>
          </div>
        </header>

        {/* Desktop Header Area with Breadcrumbs */}
        <div className="hidden lg:block pt-4 sm:pt-6 lg:pt-8 px-3 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="mb-4 text-xs font-medium text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1"
            >
              <a
                href="/admin"
                className="hover:text-slate-700 dark:hover:text-slate-200"
              >
                Dashboard
              </a>
              {breadcrumbs.map((b) => (
                <span key={b.href} className="flex items-center gap-1">
                  <span>/</span>
                  <a
                    href={b.href}
                    className="capitalize hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {b.label}
                  </a>
                </span>
              ))}
            </nav>
          )}
        </div>

        <main
          id="admin-main-content"
          tabIndex={-1}
          className="flex-1 p-3 sm:p-6 lg:p-8 pt-2 sm:pt-2 lg:pt-2 max-w-[1600px] mx-auto w-full overflow-x-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
