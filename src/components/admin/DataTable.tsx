import React, { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, value: unknown) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  idField?: string;
  loading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onSelect,
  selectedIds = [],
  idField = "id",
  loading = false,
  emptyMessage = "No data available",
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  const handleSelectAll = () => {
    if (!onSelect) return;

    const allIds = data.map((item) => String(item[idField]));
    const isAllSelected =
      allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      onSelect([]);
    } else {
      onSelect(allIds);
    }
  };

  const handleSelectItem = (id: string) => {
    if (!onSelect) return;

    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <span className="text-slate-400">↕</span>;
    }
    return sortOrder === "asc" ? (
      <span className="text-sky-600">↑</span>
    ) : (
      <span className="text-sky-600">↓</span>
    );
  };

  const getValue = (item: T, key: string): unknown => {
    if (key.includes(".")) {
      return key.split(".").reduce((obj: unknown, k: string) => {
        return obj && typeof obj === "object" && k in obj
          ? (obj as Record<string, unknown>)[k]
          : undefined;
      }, item);
    }
    return item[key];
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50">
        <div className="p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 shadow">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
            {onSelect && (
              <th className="text-left px-4 py-3 font-semibold w-12">
                <input
                  type="checkbox"
                  checked={
                    data.length > 0 &&
                    data.every((item) =>
                      selectedIds.includes(String(item[idField]))
                    )
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-600"
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`text-left px-4 py-3 font-semibold ${
                  column.width || ""
                } ${
                  column.sortable && onSort
                    ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                    : ""
                }`}
                onClick={
                  column.sortable && onSort
                    ? () => onSort(column.key)
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && onSort && renderSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.map((item, rowIndex) => {
            const itemId = String(item[idField] || rowIndex);
            return (
              <tr
                key={itemId}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
              >
                {onSelect && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(itemId)}
                      onChange={() => handleSelectItem(itemId)}
                      className="rounded border-slate-300 dark:border-slate-600"
                      aria-label={`Select item ${itemId}`}
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => {
                  const value = getValue(item, column.key);

                  return (
                    <td key={colIndex} className="px-4 py-3">
                      {column.render
                        ? column.render(item, value)
                        : String(value || "")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
