"use client";
import { createContext, useContext, useState, useCallback } from "react";

interface ToastItem {
  id: number;
  message: string;
  type?: "info" | "success" | "error";
}
interface ToastContextValue {
  push: (msg: string, type?: ToastItem["type"]) => void;
}
const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback(
    (message: string, type: ToastItem["type"] = "info") => {
      const id = Date.now();
      setItems((list) => [...list, { id, message, type }]);
      setTimeout(
        () => setItems((list) => list.filter((i) => i.id !== id)),
        3000
      );
    },
    []
  );
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 space-y-2 z-50"
      >
        {items.map((t) =>
          t.type === "error" ? (
            <div
              key={t.id}
              role="alert"
              aria-atomic="true"
              className="px-4 py-2 rounded-md shadow text-sm font-medium text-white backdrop-blur flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 bg-red-600/90"
            >
              <span>{t.message}</span>
            </div>
          ) : (
            <div
              key={t.id}
              role="status"
              aria-atomic="true"
              className={`px-4 py-2 rounded-md shadow text-sm font-medium text-white backdrop-blur flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                t.type === "success" ? "bg-emerald-600/90" : "bg-sky-600/90"
              }`}
            >
              <span>{t.message}</span>
            </div>
          )
        )}
      </div>
    </ToastCtx.Provider>
  );
}
