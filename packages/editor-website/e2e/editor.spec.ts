import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Vetgedrukt' }).waitFor();
});

test.describe('Page basics', () => {
  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Rich-text Editor - NL Design System');
  });

  test('page has document language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });
});

test.describe('Toolbar visibility', () => {
  test('all toolbar buttons are visible', async ({ page }) => {
    const buttons = [
      'Vetgedrukt',
      'Cursief',
      'Onderstrepen',
      'Code',
      'Markeren',
      'Superscript',
      'Subscript',
      'Ongedaan maken',
      'Opnieuw',
      'Genummerde lijst',
      'Ongeordende lijst',
      'Definitielijst',
      'Tabel invoegen',
      'Horizontale lijn',
      'Sneltoetsen',
      'Toon toegankelijkheidsmeldingen',
    ];

    for (const name of buttons) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }

    await expect(page.getByRole('combobox', { name: 'Selecteer tekstformaat' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Taal van het element' })).toBeVisible();
  });
});

test.describe('Text formatting', () => {
  test('toggle bold on selected text', async ({ page }) => {
    // Click the empty paragraph and type text
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('testbold');

    // Triple-click to select all text in the paragraph
    const textNode = page.getByRole('textbox').getByText('testbold');
    await textNode.click({ clickCount: 3 });

    // Click bold button — the editor internally refocuses and applies bold
    await page.getByRole('button', { name: 'Vetgedrukt' }).click();

    await expect(page.getByRole('button', { name: 'Vetgedrukt' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('toggle italic on selected text', async ({ page }) => {
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('testitalic');

    const textNode = page.getByRole('textbox').getByText('testitalic');
    await textNode.click({ clickCount: 3 });

    await page.getByRole('button', { name: 'Cursief' }).click();

    await expect(page.getByRole('button', { name: 'Cursief' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('change text format to heading via combobox', async ({ page }) => {
    const editor = page.getByRole('textbox');
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('test heading');

    await page.getByRole('combobox', { name: 'Selecteer tekstformaat' }).clear();
    await page.getByRole('option', { name: 'Kopniveau 3' }).click();

    await expect(editor.getByRole('heading', { name: 'test heading', level: 3 })).toBeVisible();
  });
});

test.describe('Lists', () => {
  test('insert ordered list', async ({ page }) => {
    const editor = page.getByRole('textbox');
    // Fill text in the empty paragraph
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).first().fill('ordered item');

    // Click the numbered list button
    await page.getByRole('button', { name: 'Genummerde lijst' }).click();

    await expect(editor.getByRole('listitem').filter({ hasText: 'ordered item' })).toBeVisible();
  });

  test('insert unordered list', async ({ page }) => {
    const editor = page.getByRole('textbox');
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).first().fill('unordered item');

    await page.getByRole('button', { name: 'Ongeordende lijst' }).click();

    await expect(editor.getByRole('listitem').filter({ hasText: 'unordered item' })).toBeVisible();
  });
});

test.describe('Undo / Redo', () => {
  test('undo and redo text input', async ({ page }) => {
    const editor = page.getByRole('textbox');
    await page.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('undoredo');

    await expect(editor.getByText('undoredo')).toBeVisible();

    await page.getByRole('button', { name: 'Ongedaan maken' }).click();
    await expect(editor.getByText('undoredo')).not.toBeVisible();

    await page.getByRole('button', { name: 'Opnieuw' }).click();
    await expect(editor.getByText('undoredo')).toBeVisible();
  });
});

test.describe('Table', () => {
  test('insert a table', async ({ page }) => {
    const editor = page.getByRole('textbox');
    const initialTableCount = await editor.getByRole('table').count();

    await page.getByRole('button', { name: 'Tabel invoegen' }).click();
    await expect(editor.getByRole('table')).toHaveCount(initialTableCount + 1);
  });
});

test.describe('Keyboard shortcuts dialog', () => {
  test('open and close shortcuts dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Sneltoetsen' }).click();

    const dialog = page.getByTestId('clippy-shortcuts-dialog');
    await expect(dialog).toBeVisible();

    await page.getByRole('button', { name: 'Sneltoetsen dialoog sluiten' }).click();
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Accessibility notifications', () => {
  test('shows notification count badge', async ({ page }) => {
    await expect(page.locator('.nl-number-badge__visible-label').first()).toBeVisible();
  });

  test('open drawer and list notifications', async ({ page }) => {
    await page.getByRole('button', { name: 'Toon toegankelijkheidsmeldingen' }).click();

    const drawer = page.getByTestId('clippy-validations-drawer');
    await expect(drawer).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aanpassen' }).first()).toBeVisible();
  });

  test('navigate to node via Aanpassen button', async ({ page }) => {
    await page.getByRole('button', { name: 'Toon toegankelijkheidsmeldingen' }).click();

    const drawer = page.getByTestId('clippy-validations-drawer');
    await expect(drawer).toBeVisible();

    await page.getByRole('button', { name: 'Aanpassen' }).first().click();
    await expect(drawer).not.toBeVisible();

    const editor = page.getByRole('textbox');
    await expect(editor).toBeFocused();
  });
});
