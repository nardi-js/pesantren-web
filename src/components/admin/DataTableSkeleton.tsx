import React from "react";

export function DataTableSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 shadow">
      <table className="w-full text-sm" aria-label="Loading data table">
        <caption className="sr-only">Data is loading, please wait...</caption>
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
            {Array.from({ length: columns }).map((_, i) => (
              <th
                key={i}
                scope="col"
                className="text-left px-4 py-2 font-semibold uppercase text-[10px] tracking-wide"
              >
                COL {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {Array.from({ length: rows }).map((_, r) => (
            <tr
              key={r}
              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
            >
              {Array.from({ length: columns }).map((__, c) => (
                <td key={c} className="px-4 py-2">
                  <span
                    className="block h-4 w-20 rounded bg-slate-300/40 dark:bg-slate-600/40 animate-pulse"
                    aria-hidden="true"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
