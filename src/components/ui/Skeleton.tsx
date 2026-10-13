export function Skeleton({
  label,
  count = 3,
  height = "h-28",
}: {
  label: string;
  count?: number;
  height?: string;
}) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <ul className="flex flex-col gap-3" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li
            key={i}
            className={`${height} animate-pulse rounded-2xl bg-tag motion-reduce:animate-none`}
          />
        ))}
      </ul>
    </div>
  );
}
