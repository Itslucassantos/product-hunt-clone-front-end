import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { VoteButton } from "./VoteButton";

const auth = { isSignedIn: true };
const toggleVote = vi.fn();
const getMyVotes = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ ...auth, getToken: async () => "token" }),
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("topic=ai") }));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/",
  Link: ({
    href,
    children,
    ...props
  }: {
    href: { pathname: string; query: Record<string, string> };
    children: ReactNode;
  }) => (
    <a
      href={`${href.pathname}?redirect_url=${encodeURIComponent(href.query.redirect_url)}`}
      {...props}
    >
      {children}
    </a>
  ),
}));
vi.mock("@/lib/api/endpoints", () => ({
  toggleVote: (...args: unknown[]) => toggleVote(...args),
  getMyVotes: (...args: unknown[]) => getMyVotes(...args),
}));

beforeEach(() => {
  auth.isSignedIn = true;
  toggleVote.mockReset();
  getMyVotes.mockReset().mockResolvedValue({ productIds: [] });
});

describe("VoteButton", () => {
  it("links to sign-in, coming back to the current page, when signed out", () => {
    auth.isSignedIn = false;
    renderWithProviders(<VoteButton productId="p1" upvotes={7} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/sign-in?redirect_url=%2F%3Ftopic%3Dai");
    expect(link).toHaveTextContent("7");
  });

  it("votes and shows the new count and pressed state", async () => {
    toggleVote.mockResolvedValue({ upvotes: 8, voted: true });
    renderWithProviders(<VoteButton productId="p1" upvotes={7} />);

    const button = await screen.findByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);

    await waitFor(() => expect(toggleVote).toHaveBeenCalledWith("p1", "token"));
    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "true"));
  });

  it("is disabled while the request is pending", async () => {
    toggleVote.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<VoteButton productId="p1" upvotes={7} />);

    const button = await screen.findByRole("button");
    await userEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
  });
});
