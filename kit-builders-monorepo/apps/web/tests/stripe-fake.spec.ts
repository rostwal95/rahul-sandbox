import { test, expect, Page } from "@playwright/test";

// Validates fake Stripe checkout flow when FAKE_STRIPE=true

async function checkout(page: Page) {
  const res = await page.request.post(
    "http://localhost:4000/v1/billing/checkout",
    { form: { price_id: "price_fake" } }
  );
  return await res.json();
}

async function status(page: Page) {
  const res = await page.request.get("http://localhost:4000/v1/billing/status");
  return await res.json();
}

test.describe("Fake Stripe checkout", () => {
  test("returns stub URL and marks subscription active", async ({ page }) => {
    const ck = await checkout(page);
    expect(ck.fake).toBeTruthy();
    expect(ck.url).toContain("success=true");
    // Simulate user hitting success URL (web app side optional) then query status
    const st = await status(page);
    expect(st.plan).toBe("price_fake");
  });
});
