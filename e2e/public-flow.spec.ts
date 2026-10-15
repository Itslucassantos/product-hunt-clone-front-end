import { expect, test } from "@playwright/test";

test.describe("signed-out visitor", () => {
  test("sees the product list and is sent to sign-in when voting", async ({ page }) => {
    await page.goto("/en");

    const voteLink = page.getByRole("link", { name: /log in to upvote/i }).first();
    await expect(voteLink).toBeVisible();
    await voteLink.click();

    await expect(page).toHaveURL(/\/en\/sign-in\?redirect_url=%2F/);
  });

  test("shows the not-found screen for unknown routes", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("admin protection", () => {
  test("redirects to sign-in and keeps the destination", async ({ page }) => {
    await page.goto("/en/admin/products");

    await expect(page).toHaveURL(/\/en\/sign-in\?redirect_url=%2Fadmin%2Fproducts/);
  });
});
