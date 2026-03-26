import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/guidelines');
  // Wait for the clippy-context custom element (not the inner textbox that gets the same id)
  await expect(page.locator('clippy-context#editor-1')).toBeVisible();
});

test.describe('Page basics', () => {
  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Toegankelijkheidsrichtlijnen - Rich-text Editor - NL Design System');
  });

  test('page has document language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });

  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Toegankelijkheidsrichtlijnen', level: 1 })).toBeVisible();
  });

  test('Richtlijnen nav link is active', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Richtlijnen' })).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Guideline examples are present', () => {
  const guidelines: Array<{ id: string; title: string }> = [
    { id: 'editor-1', title: 'Niet doen: lege alinea' },
    { id: 'editor-2', title: 'Niet doen: lege inline elementen' },
    { id: 'editor-3', title: 'Niet doen: tekst onderstrepen' },
    { id: 'editor-4', title: 'Niet doen: lege list items' },
    { id: 'editor-5', title: 'Niet doen: lege list items' },
    { id: 'editor-6', title: 'Niet doen: geordende lijst zonder opmaak' },
    { id: 'editor-7', title: 'Niet doen: lijst zonder opmaak' },
    { id: 'editor-8', title: 'Niet doen: Lege Definition List' },
    { id: 'editor-9', title: 'Niet doen: Lege rij in een tabel' },
    { id: 'editor-10', title: 'Niet doen: Afbeelding zonder alt-tekst' },
    { id: 'editor-11', title: 'Niet doen: Koptekst zonder opmaak' },
    { id: 'editor-12', title: 'Niet doen: Kopniveau overslaan' },
    { id: 'editor-13', title: 'Niet doen: Tabel zonder kopcellen' },
    { id: 'editor-15', title: 'Niet doen: Meer dan 1 hoofdkop' },
    { id: 'editor-16', title: 'Niet doen: Geen hoofdkop' },
    { id: 'editor-17', title: 'Niet doen: Definitie zonder term' },
    { id: 'editor-19', title: 'Niet doen: Heading met bold' },
    { id: 'editor-20', title: 'Niet doen: Heading met italic' },
    { id: 'editor-21', title: 'Niet doen: Onduidelijke linktekst' },
  ];

  guidelines.forEach(({ id, title }) => {
    test(`"${title}" example is present (#${id})`, async ({ page }) => {
      const context = page.locator(`clippy-context#${id}`);
      await expect(context).toBeAttached();
      await expect(context.locator('.clippy-guideline__title').filter({ hasText: title })).toBeVisible();
    });
  });
});

test.describe('Validation messages shown for bad content', () => {
  test('editor-1 (lege alinea) shows a validation warning', async ({ page }) => {
    const context = page.locator('clippy-context#editor-1');
    await expect(context).toBeAttached();
    await expect(context.locator('clippy-content')).toBeAttached();
  });

  test('editor-10 (afbeelding zonder alt) has an image in its content', async ({ page }) => {
    const slot = page.locator('clippy-context#editor-10 [slot="value"]');
    await expect(slot.locator('img')).toBeAttached();
  });

  test('editor-12 (kopniveau overslaan) has skipped heading levels in its content', async ({ page }) => {
    const textbox = page.locator('clippy-context#editor-12').getByRole('textbox');
    await expect(textbox.getByRole('heading', { level: 1 })).toBeAttached();
    await expect(textbox.getByRole('heading', { level: 3 })).toBeAttached();
  });

  test('editor-15 (meer dan 1 h1) has multiple h1s in its content', async ({ page }) => {
    const textbox = page.locator('clippy-context#editor-15').getByRole('textbox');
    await expect(textbox.getByRole('heading', { level: 1 })).toHaveCount(2);
  });

  test('editor-21 (onduidelijke linktekst) has a generic link in its content', async ({ page }) => {
    const textbox = page.locator('clippy-context#editor-21').getByRole('textbox');
    await expect(textbox.getByRole('link')).toBeAttached();
  });
});
