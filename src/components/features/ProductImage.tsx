import Image from "next/image";

const ICON_COLORS = ["#4B3BD6", "#0F766E", "#B4440B", "#0E5FA8", "#9D2B6B", "#4D6B12"];

function colorFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ICON_COLORS[hash % ICON_COLORS.length];
}

type ProductImageProps = {
  id: string;
  src: string | null;
  title: string;
  size: 40 | 64;
  dashed?: boolean;
};

export function ProductImage({ id, src, title, size, dashed = false }: ProductImageProps) {
  const box = size === 40 ? "h-10 w-10" : "h-16 w-16";
  const outline = dashed ? "border-2 border-dashed border-[color:var(--dashed)]" : "";

  if (!src) {
    return (
      <span
        className={`${box} ${outline} flex shrink-0 items-center justify-center rounded-xl font-display font-extrabold uppercase ${size === 40 ? "text-lg" : "text-2xl"} ${dashed ? "text-ink-soft" : "text-white"}`}
        style={dashed ? undefined : { backgroundColor: colorFor(id) }}
        aria-hidden="true"
      >
        {title.trim().charAt(0)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={`${box} ${outline} shrink-0 rounded-xl object-cover`}
    />
  );
}
