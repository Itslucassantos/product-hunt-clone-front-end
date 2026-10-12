const STAR_PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z";

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${n <= rating ? "text-star" : "text-star-empty"}`}
          fill="currentColor"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}
