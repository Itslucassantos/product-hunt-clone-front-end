import type { Topic } from "@/types/api";

type CategoryCardProps = {
  topic: Topic;
  selected: boolean;
  countLabel: string;
  onSelect: () => void;
};

export function CategoryCard({ topic, selected, countLabel, onSelect }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-2 rounded-2xl border-2 bg-surface p-5 text-left ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tag text-primary-text">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
          <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <span className="font-display text-lg font-extrabold">{topic.name}</span>
      {topic.description && (
        <span className="w-full truncate text-sm text-muted">{topic.description}</span>
      )}
      <span className="text-sm font-semibold text-ink-soft">{countLabel}</span>
    </button>
  );
}
