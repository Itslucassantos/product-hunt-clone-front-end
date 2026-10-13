"use client";

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { useProduct } from "@/hooks/useProduct";
import { useProducts } from "@/hooks/useProducts";
import { Link } from "@/i18n/navigation";
import { ApiRequestError } from "@/lib/api/errors";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { ProductCard } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { StarRating } from "./StarRating";
import { VoteButton } from "./VoteButton";

function Skeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="h-5 w-48 animate-pulse rounded bg-tag" />
      <div className="h-24 animate-pulse rounded-2xl bg-tag" />
      <div className="h-72 animate-pulse rounded-2xl bg-tag" />
    </div>
  );
}

function NotFound() {
  const t = useTranslations("product");

  return (
    <div className="flex flex-col items-start gap-3 py-10">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">{t("notFoundTitle")}</h1>
      <p className="text-muted">{t("notFoundText")}</p>
      <Link href="/" className="font-semibold underline">
        {t("backToProducts")}
      </Link>
    </div>
  );
}

function RelatedProducts({
  productId,
  topic,
}: {
  productId: string;
  topic: { slug: string; name: string };
}) {
  const t = useTranslations("product");
  const { data } = useProducts({ topic: topic.slug });
  const related = data?.filter((p) => p.id !== productId) ?? [];

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related" className="flex flex-col gap-3">
      <h2 id="related" className="font-display text-2xl font-extrabold">
        {t("moreIn", { topics: topic.name })}
      </h2>
      <ul className="flex flex-col gap-3">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}

export function ProductView({ id }: { id: string }) {
  const t = useTranslations();
  const format = useFormatter();
  const { data: product, isPending, isError, error, refetch } = useProduct(id);

  if (isPending) return <Skeleton />;

  if (isError) {
    if (error instanceof ApiRequestError && error.status === 404) return <NotFound />;
    return (
      <div className="flex flex-col items-start gap-2">
        <Alert>{t(`errors.${errorMessageKey(error)}`)}</Alert>
        <button type="button" onClick={() => refetch()} className="text-sm font-semibold underline">
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  const comingSoon = product.status === "COMING_SOON";
  const host = (() => {
    try {
      return new URL(product.url).host;
    } catch {
      return product.url;
    }
  })();

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label={t("product.breadcrumb")} className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              {t("nav.products")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-center gap-6">
        <ProductImage
          id={product.id}
          src={product.imageUrl}
          title={product.title}
          size={96}
          dashed={comingSoon}
        />
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">{product.title}</h1>
          <p className="text-lg text-ink-soft">{product.description}</p>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 self-start rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold hover:bg-tag"
          >
            {t("product.visitSite")}
          </a>
        </div>
        {comingSoon ? (
          <span className="rounded-full bg-tag px-3 py-1 text-sm font-semibold text-ink-soft">
            {t("product.comingSoon")}
          </span>
        ) : (
          <VoteButton
            productId={product.id}
            upvotes={product.upvotes}
            size="lg"
            redirectTo={`/products/${product.id}`}
          />
        )}
      </header>

      <div className="flex flex-wrap items-start gap-10">
        <div className="flex min-w-0 grow-[999] basis-[520px] flex-col gap-10">
          {product.imageUrl && (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
              <Image src={product.imageUrl} alt="" fill unoptimized className="object-cover" />
            </div>
          )}

          <section aria-labelledby="about" className="flex flex-col gap-3">
            <h2 id="about" className="font-display text-2xl font-extrabold">
              {t("product.about")}
            </h2>
            <p className="whitespace-pre-line text-ink-soft">
              {product.longDescription ?? t("product.noDescription")}
            </p>
          </section>

          {product.topics[0] && (
            <RelatedProducts productId={product.id} topic={product.topics[0]} />
          )}
        </div>

        <aside className="flex grow basis-[320px] flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
          <section aria-labelledby="details" className="flex flex-col gap-3">
            <h2 id="details" className="font-display text-xl font-extrabold">
              {t("product.details")}
            </h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t("product.votes")}</dt>
                <dd className="font-semibold">{product.upvotes}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t("product.publishedOn")}</dt>
                <dd className="font-semibold">
                  <time dateTime={product.createdAt}>
                    {format.dateTime(new Date(product.createdAt), { dateStyle: "long" })}
                  </time>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t("product.website")}</dt>
                <dd className="min-w-0 truncate font-semibold">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {host}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <hr className="border-border" />

          <section aria-labelledby="topics" className="flex flex-col gap-3">
            <h2 id="topics" className="font-display text-xl font-extrabold">
              {t("product.topics")}
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {product.topics.map((topic) => (
                <li key={topic.id}>
                  <Link
                    href={{ pathname: "/categories", query: { topic: topic.slug } }}
                    className="rounded-full bg-tag px-2.5 py-0.5 text-xs text-ink-soft hover:underline"
                  >
                    {topic.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {product.review && (
            <>
              <hr className="border-border" />
              <section aria-labelledby="review" className="flex flex-col gap-3">
                <h2 id="review" className="font-display text-xl font-extrabold">
                  {t("product.reviewedByUs")}
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={product.review.rating} />
                  <span className="text-xs font-semibold text-ink-soft">
                    {t("home.rating", { rating: product.review.rating })}
                  </span>
                </div>
                <p className="text-sm text-ink-soft">{product.review.summary}</p>
              </section>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
