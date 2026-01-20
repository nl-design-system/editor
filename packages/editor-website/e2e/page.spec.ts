import { test, expect } from '@playwright/test';

test('Page has correct title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Rich-text Editor - NL Design System');
  await page.getByRole('paragraph').filter({ hasText: /^$/ }).fill('Paragraaf.');
  const a11yButton = page.getByRole('button', { name: 'Toon toegankelijkheidsmeldingen' });
  await expect(page.locator('data .nl-number-badge__visible-label')).toHaveText('3');
  await a11yButton.click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Aanpassen' }).first().click();
  await page.waitForTimeout(500);
  await page.keyboard.type(' heading');
  await page.getByLabel('Tekst formaat selecteren').selectOption('h3');
  expect(page.getByRole('heading', { level: 3 })).toBeDefined();
  await expect(page.locator('data .nl-number-badge__visible-label')).toHaveText('2');
  await a11yButton.click();
  expect(page.getByText('Lijst moet een semantische lijst zijn')).toBeDefined();
  await expect(page.getByRole('button', { name: 'Aanpassen' })).toHaveCount(2);
});
