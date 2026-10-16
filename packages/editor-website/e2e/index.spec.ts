import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('clippy-context#clippy-example-heading-level')).toBeVisible();
});

test.describe('Page basics', () => {
  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Rich-text Editor - NL Design System');
  });

  test('page has document language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });

  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'NL Design System - Rich-text editor', level: 1 })).toBeVisible();
  });

  test('headings do not skip a level', async ({ page }) => {
    const levels = await page
      .locator('main')
      .locator(':is(h1, h2, h3, h4, h5, h6):not(clippy-content *, [slot="value"] *)')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));

    levels.reduce((previous, level) => {
      expect(level).toBeLessThanOrEqual(previous + 1);
      return level;
    });
  });
});

test.describe('Example', () => {
  test('flags the skipped heading level', async ({ page }) => {
    const context = page.locator('clippy-context#clippy-example-heading-level');

    await expect(context.locator('clippy-validations-gutter .clippy-validations-gutter__indicator')).toHaveCount(1);
    await expect(context.locator('clippy-validations-list clippy-validation-item')).toHaveCount(1);
  });
});

test.describe('Navigation', () => {
  test('links to the demo page', async ({ page }) => {
    await page.getByRole('main').getByRole('link', { name: 'demo' }).click();

    await expect(page).toHaveURL('/demo');
    await expect(page.getByRole('heading', { name: 'Demo', level: 1 })).toBeVisible();
  });
});
