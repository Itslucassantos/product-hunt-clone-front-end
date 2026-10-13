import type { ProductStatus } from "@/types/api";

export function StatusBadge({ status, label }: { status: ProductStatus; label: string }) {
  const style =
    status === "PUBLISHED"
      ? "border border-solid border-border-strong bg-tag"
      : "border border-dashed border-[color:var(--dashed)]";

  return <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${style}`}>{label}</span>;
}
