"use client";
import { createContext, useContext, useState, useCallback } from "react";

interface ToastItem {
  id: number;
  title?: string;
  description?: string;
  message?: string;
  type?: "info" | "success" | "error";
  variant?: "info" | "success" | "error";
}

interface ToastContextValue {
  push: (msg: string | ToastItem, type?: ToastItem["type"]) => void;
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
    (msg: string | ToastItem, type: ToastItem["type"] = "info") => {
      const id = Date.now();
      let toastItem: ToastItem;

      if (typeof msg === "string") {
        toastItem = { id, message: msg, type };
      } else {
        // Handle object format {title, description, variant}
        toastItem = {
          id,
          title: msg.title,
          description: msg.description,
          message: msg.message || msg.description,
          type: msg.variant || msg.type || type,
        };
      }

      setItems((list) => [...list, toastItem]);
      setTimeout(
        () => setItems((list) => list.filter((i) => i.id !== id)),
        4000
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
        {items.map((t) => {
          const message =
            t.message || t.description || t.title || "Notification";
          const toastType = t.type || t.variant || "info";

          return toastType === "error" ? (
            <div
              key={t.id}
              role="alert"
              aria-atomic="true"
              className="px-4 py-3 rounded-md shadow-lg text-sm font-medium text-white backdrop-blur flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 bg-red-600/90 min-w-72"
            >
              {t.title && (
                <div className="font-semibold text-sm">{t.title}</div>
              )}
              <span className="text-sm opacity-90">{message}</span>
            </div>
          ) : (
            <div
              key={t.id}
              role="status"
              aria-atomic="true"
              className={`px-4 py-3 rounded-md shadow-lg text-sm font-medium text-white backdrop-blur flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 min-w-72 ${
                toastType === "success" ? "bg-emerald-600/90" : "bg-sky-600/90"
              }`}
            >
              {t.title && (
                <div className="font-semibold text-sm">{t.title}</div>
              )}
              <span className="text-sm opacity-90">{message}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
