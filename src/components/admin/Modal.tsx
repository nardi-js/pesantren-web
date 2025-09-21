"use client";
import React, { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onCloseAction: () => void;
  footer?: React.ReactNode;
}
export function Modal({
  open,
  title,
  children,
  onCloseAction,
  footer,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const titleId = useRef<string>(
    `modal-title-${Math.random().toString(36).slice(2)}`
  );
  const bodyId = useRef<string>(
    `modal-body-${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAction();
    };
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onCloseAction]);

  // Focus management & trap
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      const node = dialogRef.current;
      if (node) {
        // Focus first focusable
        const focusables = node.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusables[0] || node).focus();
      }
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusables || focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    } else if (!open && previouslyFocused.current instanceof HTMLElement) {
      (previouslyFocused.current as HTMLElement).focus();
    }
  }, [open]);
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"} `}>
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onCloseAction}
      />
      <div
        className={`absolute inset-0 flex items-start md:items-center justify-center overflow-y-auto p-4 sm:p-6`}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId.current}
          aria-describedby={bodyId.current}
          className={`w-full max-w-lg outline-none focus:outline-none transform transition-all ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          } duration-300`}
          tabIndex={-1}
        >
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 h-12 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60">
              <h2
                id={titleId.current}
                className="text-sm font-semibold tracking-wide"
              >
                {title}
              </h2>
              <button
                onClick={onCloseAction}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
                aria-label="Close dialog"
              >
                Close
              </button>
            </div>
            <div id={bodyId.current} className="p-5 text-sm space-y-4">
              {children}
            </div>
            {footer && (
              <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-2">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
