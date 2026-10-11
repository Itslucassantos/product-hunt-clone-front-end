import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full max-w-[440px] rounded-3xl border border-border bg-surface p-8">
      <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
