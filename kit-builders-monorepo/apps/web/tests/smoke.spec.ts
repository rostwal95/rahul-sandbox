import { test, expect } from '@playwright/test';

test('login and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@kit.test');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL('**/dashboard');
  await expect(page.getByText('Dashboard')).toBeVisible();
});

test('create a page from template', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@kit.test');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL('**/dashboard');
  await page.click('text=Landing Pages');
  await page.click('text=Simple Hero + CTA');
  await page.waitForTimeout(500);
  await expect(page.getByText('Your pages')).toBeVisible();
});
