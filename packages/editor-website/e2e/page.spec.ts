import { test, expect } from '@playwright/test';

test('Page has correct title', async ({ page }) => {
  await page.goto('http://localhost:5174/');

  await expect(page).toHaveTitle('Rich-text Editor - NL Design System');
  await page.goto('http://localhost:5173/');
  await page.getByRole('paragraph').filter({ hasText: /^$/ }).fill('Paragraaf.');
  await page.getByRole('listitem').nth(5).click();
  await page.getByRole('button', { name: 'Aanpassen' }).first().click();
  await page.getByRole('listitem').nth(3).click();
  await page.getByRole('button', { name: 'Aanpassen' }).first().click();
  await page.getByRole('heading', { name: 'Dat mag niet, he' }).click();
  await page.waitForTimeout(100); // Wait for selector
  await page.getByRole('combobox').selectOption('h3');
  expect(page.getByRole('heading', { level: 3 })).toBeDefined();
  await page.getByLabel('Werkbalk tekstbewerker').getByText('1', { exact: true }).click();
  page.getByText('Lijst moet een semantische lijst zijn');
  await expect(page.getByRole('button', { name: 'Aanpassen' })).toHaveCount(1);
});
