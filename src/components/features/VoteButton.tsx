"use client";

import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useMyVotes } from "@/hooks/useMyVotes";
import { useToggleVote } from "@/hooks/useToggleVote";
import { Link } from "@/i18n/navigation";
import { errorMessageKey } from "@/lib/api/error-message-key";

const BOX =
  "flex min-h-14 min-w-14 shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold";

export function VoteButton({ productId, upvotes }: { productId: string; upvotes: number }) {
  const t = useTranslations();
  const { isSignedIn } = useAuth();
  const { data: myVotes } = useMyVotes();
  const vote = useToggleVote(productId);
  const voted = myVotes?.has(productId) ?? false;

  const content = (
    <>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M12 6 3 18h18z" />
      </svg>
      {upvotes}
    </>
  );

  if (!isSignedIn) {
    return (
      <Link
        href={{ pathname: "/sign-in", query: { redirect_url: "/" } }}
        aria-label={t("vote.signInToVote", { count: upvotes })}
        className={`${BOX} border-border-strong`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => vote.mutate()}
        disabled={vote.isPending}
        aria-pressed={voted}
        aria-label={t(voted ? "vote.remove" : "vote.add", { count: upvotes })}
        className={`${BOX} disabled:opacity-60 ${
          voted ? "border-primary bg-primary text-white" : "border-border-strong"
        }`}
      >
        {content}
      </button>
      {vote.isError && (
        <span role="alert" className="max-w-24 text-center text-xs text-danger">
          {t(`errors.${errorMessageKey(vote.error)}`)}
        </span>
      )}
    </div>
  );
}
