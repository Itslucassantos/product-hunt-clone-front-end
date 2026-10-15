"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRateLimit } from "@/components/RateLimit";
import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  children?: ReactNode;
  cancelLabel: string;
  onCancel: () => void;
  variant?: "destructive" | "blocked";
  confirmLabel?: string;
  onConfirm?: () => void;
  loading?: boolean;
  extraAction?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  children,
  cancelLabel,
  onCancel,
  variant = "destructive",
  confirmLabel,
  onConfirm,
  loading = false,
  extraAction,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { limited } = useRateLimit();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onCancel();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
      className="w-full max-w-[420px] rounded-[20px] border border-border bg-surface p-0 text-ink backdrop:bg-black/60 open:animate-dialog-in motion-reduce:animate-none"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-display text-xl font-extrabold">
          {title}
        </h2>
        <p id="confirm-description" className="mt-2 text-sm text-ink-soft">
          {description}
        </p>
        {children}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {extraAction}
          <Button variant="secondary" onClick={onCancel} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
          {variant === "destructive" && (
            <Button
              onClick={onConfirm}
              loading={loading}
              disabled={limited}
              className="bg-danger-solid text-white"
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
