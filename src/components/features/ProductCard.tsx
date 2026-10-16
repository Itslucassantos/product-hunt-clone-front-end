import { Link } from "@/i18n/navigation";
import type { ProductListItem } from "@/types/api";
import { ProductImage } from "./ProductImage";
import { VoteButton } from "./VoteButton";

type ProductCardProps = {
  product: ProductListItem;
  votes?: "button" | "count";
};

export function ProductCard({ product, votes = "button" }: ProductCardProps) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
      <ProductImage id={product.id} src={product.imageUrl} title={product.title} size={64} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/products/${product.id}`}
          className="truncate font-display text-lg font-extrabold hover:underline"
        >
          {product.title}
        </Link>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.description}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {product.topics.map((topic) => (
            <li key={topic.id} className="rounded-full bg-tag px-2.5 py-0.5 text-xs text-ink-soft">
              {topic.name}
            </li>
          ))}
        </ul>
      </div>

      {votes === "button" ? (
        <VoteButton productId={product.id} upvotes={product.upvotes} />
      ) : (
        <span className="flex min-h-14 min-w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border-strong px-3 py-2 text-sm font-semibold">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M12 6 3 18h18z" />
          </svg>
          {product.upvotes}
        </span>
      )}
    </li>
  );
}
