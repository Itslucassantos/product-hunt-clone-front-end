"use client";

import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, type ReactNode } from "react";
import { useRateLimit } from "@/components/RateLimit";
import { useMyVotes } from "@/hooks/useMyVotes";
import { useToggleVote } from "@/hooks/useToggleVote";
import { Link, usePathname } from "@/i18n/navigation";

const BOX = {
  md: "flex min-h-14 min-w-14 shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold",
  lg: "flex min-h-16 min-w-20 shrink-0 flex-col items-center justify-center rounded-2xl border px-5 py-2 text-lg font-bold",
};

type VoteButtonProps = {
  productId: string;
  upvotes: number;
  size?: keyof typeof BOX;
};

type SignInLinkProps = {
  upvotes: number;
  size: keyof typeof BOX;
  redirectTo: string;
  children: ReactNode;
};

function SignInLink({ upvotes, size, redirectTo, children }: SignInLinkProps) {
  const t = useTranslations();

  return (
    <Link
      href={{ pathname: "/sign-in", query: { redirect_url: redirectTo } }}
      aria-label={t("vote.signInToVote", { count: upvotes })}
      className={`${BOX[size]} border-border-strong`}
    >
      {children}
    </Link>
  );
}

function SignInLinkWithQuery(props: Omit<SignInLinkProps, "redirectTo">) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  return <SignInLink {...props} redirectTo={search ? `${pathname}?${search}` : pathname} />;
}

export function VoteButton({ productId, upvotes, size = "md" }: VoteButtonProps) {
  const t = useTranslations();
  const { isSignedIn } = useAuth();
  const { data: myVotes } = useMyVotes();
  const pathname = usePathname();
  const { limited } = useRateLimit();
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
      <Suspense
        fallback={
          <SignInLink upvotes={upvotes} size={size} redirectTo={pathname}>
            {content}
          </SignInLink>
        }
      >
        <SignInLinkWithQuery upvotes={upvotes} size={size}>
          {content}
        </SignInLinkWithQuery>
      </Suspense>
    );
  }

  return (
    <button
      type="button"
      onClick={() => vote.mutate()}
      disabled={vote.isPending || limited}
      aria-pressed={voted}
      aria-label={t(voted ? "vote.remove" : "vote.add", { count: upvotes })}
      className={`${BOX[size]} disabled:opacity-60 ${
        voted ? "border-primary bg-primary text-white" : "border-border-strong"
      }`}
    >
      {content}
    </button>
  );
}
