import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/configuratie');
  const minimalEditor = page.locator('#clippy-editor-minimal-toolbar');
  await expect(minimalEditor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toBeVisible();
});

test.describe('Page basics', () => {
  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Toolbar configuratie - Rich-text Editor - NL Design System');
  });

  test('page has document language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });

  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Toolbar configuratie', level: 1 })).toBeVisible();
  });
});

test.describe('Minimal toolbar editor', () => {
  test('only configured buttons are visible', async ({ page }) => {
    const editor = page.locator('#clippy-editor-minimal-toolbar');
    await expect(editor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Cursief', exact: true })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Onderstrepen', exact: true })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Ongedaan maken', exact: true })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Opnieuw', exact: true })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Link', exact: true })).toBeVisible();
  });

  test('unconfigured buttons are not present', async ({ page }) => {
    const editor = page.locator('#clippy-editor-minimal-toolbar');
    await expect(editor.getByRole('button', { name: 'Genummerde lijst', exact: true })).not.toBeVisible();
    await expect(editor.getByRole('button', { name: 'Tabel invoegen', exact: true })).not.toBeVisible();
  });

  test('can type and format text', async ({ page }) => {
    const editor = page.locator('#clippy-editor-minimal-toolbar');
    const textbox = editor.getByRole('textbox');

    await textbox.click();
    await page.keyboard.type('configuratietest');

    const text = textbox.getByText('configuratietest');
    await text.click({ clickCount: 3 });
    await editor.getByRole('button', { name: 'Vetgedrukt', exact: true }).click();

    await expect(editor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

test.describe('Live configuration demo', () => {
  test('textarea and live editor are visible', async ({ page }) => {
    await expect(page.locator('#toolbar-config-input')).toBeVisible();
    await expect(page.locator('clippy-editor#clippy-editor-live-config')).toBeVisible();
  });

  test('textarea is pre-filled with JSON', async ({ page }) => {
    const textarea = page.locator('#toolbar-config-input');
    const value = await textarea.inputValue();
    expect(() => JSON.parse(value)).not.toThrow();
  });

  test('invalid JSON shows an error message', async ({ page }) => {
    await page.locator('#toolbar-config-input').fill('not valid json');
    await page.locator('#toolbar-config-input').press('Space');

    const errorEl = page.locator('#toolbar-config-error');
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText('Ongeldige JSON');
  });
});
