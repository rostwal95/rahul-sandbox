import { test, expect } from "@playwright/test";

// Minimal route coverage for /email/preview/welcome
// Asserts dev-only notice when not in development build, and heading when in dev.

test.describe("email preview welcome", () => {
  test("renders dev-only notice or preview heading", async ({ page }) => {
    await page.goto("/email/preview/welcome");
    // Either we see the dev-only guard text or the preview heading + iframe
    const devOnly = page.getByText("Email previews are dev-only.");
    const heading = page.getByRole("heading", { name: /Welcome Email/ });

    if (await devOnly.isVisible().catch(() => false)) {
      await expect(devOnly).toBeVisible();
    } else {
      await expect(heading).toBeVisible();
      await expect(page.locator("iframe")).toHaveCount(1);
    }
  });
});
