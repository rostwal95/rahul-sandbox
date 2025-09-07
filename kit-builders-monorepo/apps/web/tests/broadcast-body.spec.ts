import { test, expect } from '@playwright/test';

test('broadcast test contains HTML body', async ({ page, request }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@kit.test');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL('**/dashboard');

  await page.click('text=Email Broadcasts');
  await page.waitForSelector('text=Send Test');

  const token = `BODY-${Date.now()}`;
  // type into the rich editor (fallback: insert at end via AI CTA which adds <a>)
  await page.click('button:has-text("AI: CTA")');
  await page.waitForTimeout(500);

  await page.fill('input[placeholder="Subject"]', token);
  await page.click('button:has-text("Send Test")');

  // Poll Mailhog for body content
  let htmlFound = false;
  for (let i=0;i<10;i++){
    const res = await request.get('http://localhost:8025/api/v2/messages');
    const j = await res.json();
    const msg = (j.items || [])[0];
    const body = msg?.Content?.Body || '';
    htmlFound = /<a[^>]*>/.test(body);
    if(htmlFound) break;
    await page.waitForTimeout(1000);
  }
  expect(htmlFound).toBeTruthy();
});
