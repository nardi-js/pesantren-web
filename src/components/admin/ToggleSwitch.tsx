"use client";
import { useState, useCallback } from "react";

interface ToggleSwitchProps {
  label: string;
  onChange?(value: boolean): void;
  initial?: boolean;
  id?: string;
}

export function ToggleSwitch({
  label,
  onChange,
  initial = true,
  id,
}: ToggleSwitchProps) {
  const [on, setOn] = useState<boolean>(initial);
  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      onChange?.(next);
      return next;
    });
  }, [onChange]);
  const wrapperId = id || undefined;
  return (
    <div className="inline-flex items-center gap-2" id={wrapperId}>
      {on ? (
        <button
          type="button"
          role="switch"
          aria-checked="true"
          aria-labelledby={wrapperId}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          className="relative inline-flex items-center h-6 px-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-xs font-medium bg-sky-500/90 text-white"
        >
          <span className="h-4 w-4 rounded-full bg-white dark:bg-slate-200 shadow transform transition translate-x-5" />
        </button>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked="false"
          aria-labelledby={wrapperId}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          className="relative inline-flex items-center h-6 px-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 text-xs font-medium bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <span className="h-4 w-4 rounded-full bg-white dark:bg-slate-200 shadow transform transition translate-x-0" />
        </button>
      )}
      <span
        className="text-xs select-none"
        onClick={toggle}
        role="presentation"
      >
        {label}
      </span>
    </div>
  );
}
