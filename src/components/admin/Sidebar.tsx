"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { adminNavItems } from "./navConfig";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  open: boolean;
  onCloseAction: () => void;
  title?: string;
  collapsed: boolean;
  onToggleCollapseAction: () => void;
}

export function Sidebar({
  open,
  onCloseAction,
  title,
  collapsed,
  onToggleCollapseAction,
}: SidebarProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstFocusable = useRef<HTMLElement | null>(null);
  const lastFocusable = useRef<HTMLElement | null>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onCloseAction();
        return;
      }
      if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        firstFocusable.current = first;
        lastFocusable.current = last;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [open, onCloseAction]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      const first = panelRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus();
    } else {
      document.removeEventListener("keydown", handleKey);
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  useEffect(() => {
    onCloseAction();
  }, [pathname, onCloseAction]);

  return (
    <div className="h-full">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseAction}
        aria-hidden="true"
      />
      <aside
        id="admin-sidebar"
        ref={panelRef}
        className={`group fixed z-40 inset-y-0 left-0 flex flex-col will-change-transform ${
          collapsed ? "w-[4.75rem]" : "w-64"
        } border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-sky-900/10 lg:translate-x-0 transform transition-[width,transform] duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:shadow-none h-screen`}
        aria-label="Sidebar navigation"
        data-collapsed={collapsed || undefined}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between gap-2 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex flex-col overflow-hidden">
            <span
              className={`font-semibold tracking-wide bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent transition-colors ${
                collapsed ? "text-base" : "text-lg"
              }`}
            >
              Admin UI
            </span>
            {!collapsed && title && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            <button
              onClick={onCloseAction}
              className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <svg
                className="w-4 h-4"
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
            </button>
            {/* Desktop collapse button */}
            <button
              onClick={onToggleCollapseAction}
              className="hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-semibold transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className="pointer-events-none select-none">
                {collapsed ? "››" : "‹‹"}
              </span>
            </button>
          </div>
        </div>
        {/* Navigation */}
        <nav
          className={`flex-1 overflow-y-auto py-4 ${
            collapsed ? "px-2" : "px-3"
          } space-y-1 custom-scrollbars pr-2`}
          aria-label="Primary"
        >
          {adminNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group/item flex items-center gap-2 rounded-md ${
                  collapsed ? "px-2 justify-center" : "px-3"
                } py-2 text-sm font-medium transition-colors border-l-2 relative ${
                  active
                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500"
                    : "border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-slate-700/40"
                }`}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={`inline-block flex-shrink-0 h-2 w-2 rounded-full transition-colors ${
                    active
                      ? "bg-sky-500"
                      : "bg-slate-400 group-hover/item:bg-sky-400"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate transition-opacity">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Footer */}
        <div
          className={`p-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 space-y-3 transition-colors ${
            collapsed ? "items-center flex flex-col" : ""
          }`}
        >
          <ThemeToggle
            className={`${
              collapsed ? "w-9 h-9 p-0 justify-center" : "w-full justify-center"
            }`}
          />
          {!collapsed && (
            <p className="text-center">
              &copy; {new Date().getFullYear()} Admin UI
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
