import { test, expect } from '@playwright/test';

test('Page has correct title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Rich-text Editor - NL Design System');
});
