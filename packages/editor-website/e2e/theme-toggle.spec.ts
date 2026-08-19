import { expect, test } from '@playwright/test';

const DARK_CLASS = 'ma-theme--color-scheme-dark';

test.describe('Dark mode toggle', () => {
  test('starts in light mode by default and toggles to dark', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: 'Donkere modus' });

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(html).not.toHaveClass(new RegExp(DARK_CLASS));

    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(html).toHaveClass(new RegExp(DARK_CLASS));
  });

  test('persists the choice across reloads', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: 'Donkere modus' });

    await toggle.click();
    await expect(html).toHaveClass(new RegExp(DARK_CLASS));

    await page.reload();

    await expect(html).toHaveClass(new RegExp(DARK_CLASS));
    await expect(page.getByRole('button', { name: 'Donkere modus' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('honours the prefers-color-scheme setting on first visit', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(new RegExp(DARK_CLASS));
    await expect(page.getByRole('button', { name: 'Donkere modus' })).toHaveAttribute('aria-pressed', 'true');

    await context.close();
  });
});
