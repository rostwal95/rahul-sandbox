import { test, expect } from '@playwright/test';

test('compose broadcast and send test (Mailhog)', async ({ page, request }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@kit.test');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log in")');
  await page.waitForURL('**/dashboard');

  await page.click('text=Email Broadcasts');
  await page.waitForSelector('text=Send Test');

  // change subject to include a unique token
  const token = `KIT-${Date.now()}`;
  await page.fill('input[placeholder="Subject"]', token);
  await page.click('button:has-text("Send Test")');

  // Query Mailhog API for the token
  let found = false;
  for (let i=0;i<10;i++){
    const res = await request.get('http://localhost:8025/api/v2/messages');
    const j = await res.json();
    found = (j.items || []).some((m:any)=> (m.Content.Headers.Subject||[]).join(' ').includes(token));
    if(found) break;
    await page.waitForTimeout(1000);
  }
  expect(found).toBeTruthy();
});
