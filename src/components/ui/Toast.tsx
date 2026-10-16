"use client";

import { useTranslations } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error";
type ToastData = { id: number; kind: ToastKind; message: string };

const DURATION_MS = 3000;
const MAX_TOASTS = 3;

const ToastContext = createContext<{ show: (kind: ToastKind, message: string) => void } | null>(
  null,
);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return {
    success: (message: string) => context.show("success", message),
    error: (message: string) => context.show("error", message),
  };
}

function ToastItem({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const t = useTranslations("common");
  const [paused, setPaused] = useState(false);

  const isError = toast.kind === "error";

  useEffect(() => {
    if (paused || isError) return;
    const timer = setTimeout(onClose, DURATION_MS);
    return () => clearTimeout(timer);
  }, [paused, isError, onClose]);

  return (
    <li
      role={isError ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex animate-toast-in motion-reduce:animate-none items-center gap-3 rounded-2xl border border-border bg-surface py-1 pl-4 pr-1 shadow-lg"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 shrink-0 ${isError ? "text-danger" : "text-primary-text"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isError ? (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16.5v.01" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12.5 3 3 5-6" />
          </>
        )}
      </svg>
      <span className="flex-1 text-sm font-semibold">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-tag"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </li>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback((kind: ToastKind, message: string) => {
    setToasts((current) => {
      if (current.some((toast) => toast.kind === kind && toast.message === message)) return current;
      return [
        ...current.slice(-(MAX_TOASTS - 1)),
        { id: Date.now() + Math.random(), kind, message },
      ];
    });
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ul className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm flex-col gap-2 sm:left-auto sm:right-4 sm:mx-0">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => setToasts((current) => current.filter((x) => x.id !== toast.id))}
          />
        ))}
      </ul>
    </ToastContext.Provider>
  );
}
