import type { ReactNode } from "react";

type EmptyStateProps = { title: string; text: string; action?: ReactNode };

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border-2 border-dashed border-[color:var(--dashed)] p-6">
      <h2 className="font-display text-lg font-extrabold">{title}</h2>
      <p className="text-sm text-muted">{text}</p>
      {action}
    </div>
  );
}
