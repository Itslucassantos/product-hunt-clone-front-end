import type { ProductListItem } from "@/types/api";
import { ProductImage } from "./ProductImage";
import { VoteButton } from "./VoteButton";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
      <ProductImage id={product.id} src={product.imageUrl} title={product.title} size={64} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate font-display text-lg font-extrabold hover:underline"
        >
          {product.title}
        </a>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.description}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {product.topics.map((topic) => (
            <li key={topic.id} className="rounded-full bg-tag px-2.5 py-0.5 text-xs text-ink-soft">
              {topic.name}
            </li>
          ))}
        </ul>
      </div>

      <VoteButton productId={product.id} upvotes={product.upvotes} />
    </li>
  );
}
