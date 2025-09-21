import React from "react";

export function SummaryCard({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value: number | string;
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-md hover:shadow-lg transition-all hover:scale-[1.015]">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-sky-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {icon && (
            <span className="text-sky-500 dark:text-sky-400">{icon}</span>
          )}
          <span>{label}</span>
        </div>
        <div className="h-8 flex items-end">
          {loading ? (
            <span className="animate-pulse h-6 w-16 rounded bg-slate-300/40 dark:bg-slate-600/40" />
          ) : (
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
              {value}
            </span>
          )}
        </div>
        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          Hover for effect
        </div>
      </div>
    </div>
  );
}
