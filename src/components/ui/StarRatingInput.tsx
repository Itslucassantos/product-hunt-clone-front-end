"use client";

import { useTranslations } from "next-intl";

const STAR_PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z";

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const t = useTranslations("admin.form");

  return (
    <div role="group" aria-label={t("rating")} className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          id={n === 1 ? "field-rating" : undefined}
          aria-pressed={value === n}
          aria-label={t("ratingOption", { rating: n })}
          onClick={() => onChange(n)}
          className="flex h-11 w-11 items-center justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-7 w-7 ${n <= value ? "text-star" : "text-star-empty"}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}
