export function Skeleton({
  label,
  count = 3,
  height = "h-28",
  listClassName = "flex flex-col gap-3",
  itemClassName,
}: {
  label: string;
  count?: number;
  height?: string;
  listClassName?: string;
  itemClassName?: string;
}) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <ul className={listClassName} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li
            key={i}
            className={`${itemClassName ?? `${height} rounded-2xl`} animate-pulse bg-tag motion-reduce:animate-none`}
          />
        ))}
      </ul>
    </div>
  );
}
