import { test, expect, Page } from "@playwright/test";

// Assumptions: seed creates a page with slug 'welcome'. Public page at /p/welcome
// Flow: visit page, submit email, fetch confirmation link via dev helper, visit confirm, land on thanks page.

const TEST_EMAIL = `user_${Date.now()}@example.test`;

async function fetchLatestConfirmation(page: Page) {
  const res = await page.request.get(
    "http://localhost:4000/v1/dev/latest_confirmation"
  );
  return await res.json();
}

test.describe("Subscribe → Confirm → Welcome sequence", () => {
  test("user can subscribe and confirm", async ({ page }) => {
    await page.goto("http://localhost:3000/p/welcome");
    // Fill and submit subscribe form (input is likely type=email or text inside form)
    const input = page
      .locator('form input[type="email"], form input[type="text"]')
      .first();
    await input.fill(TEST_EMAIL);
    await Promise.all([
      page.waitForTimeout(300), // network debounce
      page.locator('form button[type="submit"]').click(),
    ]);

    // Poll confirmation token
    let tokenData: any = null;
    for (let i = 0; i < 10; i++) {
      tokenData = await fetchLatestConfirmation(page);
      if (tokenData?.token) break;
      await page.waitForTimeout(300);
    }
    expect(tokenData?.token).toBeTruthy();

    // Visit confirm URL
    await page.goto(
      tokenData.url.replace("http://localhost", "http://localhost")
    ); // no-op; placeholder for potential host adjustments

    // Expect thank you page
    await expect(page).toHaveURL(/\/p\/welcome\/thanks/);
    await expect(page.locator("body")).toContainText(/thank/i);
  });
});
