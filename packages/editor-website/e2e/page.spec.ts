import { test, expect } from '@playwright/test';

test('Page has correct title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Rich-text Editor - NL Design System');
  await page.getByRole('paragraph').filter({ hasText: /^$/ }).fill('Paragraaf.');
  await page.getByLabel('Werkbalk tekstbewerker').getByText('3', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Aanpassen' }).first().click();
  await page.waitForTimeout(500);
  await page.keyboard.type(' heading');
  await page.getByRole('combobox').selectOption('h3');
  expect(page.getByRole('heading', { level: 3 })).toBeDefined();
  const toolbarNumberButton = page.getByLabel('Werkbalk tekstbewerker').getByText('2', { exact: true });
  await expect(toolbarNumberButton).toBeVisible();
  await toolbarNumberButton.click();
  expect(page.getByText('Lijst moet een semantische lijst zijn')).toBeDefined();
  await expect(page.getByRole('button', { name: 'Aanpassen' })).toHaveCount(2);
});
