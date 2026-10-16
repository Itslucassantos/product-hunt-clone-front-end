import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { ProductForm } from "./ProductForm";

const push = vi.fn();
const createProduct = vi.fn();

vi.mock("@clerk/nextjs", () => ({ useAuth: () => ({ getToken: async () => "token" }) }));
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
  Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/api/endpoints", () => ({
  listTopics: async () => [
    { id: "t1", slug: "ai", name: "AI", description: null, position: 1, productCount: 0 },
  ],
  createProduct: (...args: unknown[]) => createProduct(...args),
  updateProduct: vi.fn(),
  saveReview: vi.fn(),
  removeReview: vi.fn(),
}));

beforeEach(() => {
  push.mockReset();
  createProduct.mockReset();
});

describe("ProductForm", () => {
  it("shows an error summary, focuses it and does not call the API when invalid", async () => {
    renderWithProviders(<ProductForm />);

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("Fix 4 fields to save this product");
    await waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(createProduct).not.toHaveBeenCalled();
  });

  it("rejects a website that does not start with https://", async () => {
    renderWithProviders(<ProductForm />);

    await userEvent.type(screen.getByLabelText("Website"), "http://example.com");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByLabelText("Website")).toHaveAttribute("aria-invalid", "true");
  });

  it("creates the product and goes back to the list", async () => {
    createProduct.mockResolvedValue({ id: "new-id" });
    renderWithProviders(<ProductForm />);

    await userEvent.type(screen.getByLabelText("Name"), "My product");
    await userEvent.type(screen.getByLabelText("Short description"), "Does things");
    await userEvent.type(screen.getByLabelText("Website"), "https://example.com");
    await userEvent.click(await screen.findByRole("button", { name: "AI" }));
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "My product",
        url: "https://example.com",
        status: "PUBLISHED",
        topicIds: ["t1"],
      }),
      "token",
    );
  });
});
