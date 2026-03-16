import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('clippy-editor').first().getByRole('button', { name: 'Vetgedrukt' })).toBeVisible();
});

test.describe('Page basics', () => {
  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Rich-text Editor (React) - NL Design System');
  });

  test('page has document language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });
});

test.describe('Clippy Editor rendering', () => {
  test('editor component is visible', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor').first();
    await expect(clippyEditor).toBeVisible();
  });

  test('toolbar buttons are visible', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor').first();
    await expect(clippyEditor.getByRole('button', { name: 'Vetgedrukt' })).toBeVisible();
    await expect(clippyEditor.getByRole('button', { name: 'Cursief' })).toBeVisible();
    await expect(clippyEditor.getByRole('button', { name: 'Onderstrepen' })).toBeVisible();
  });

  test('toolbar comboboxes are visible', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor').first();
    await expect(clippyEditor.getByRole('combobox', { name: 'Selecteer tekstformaat' })).toBeVisible();
    await expect(clippyEditor.getByRole('combobox', { name: 'Taal van het element' })).toBeVisible();
  });

  test('initial content is rendered correctly', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor').first();
    const editor = clippyEditor.getByRole('textbox');

    // Check for the initial heading from main.tsx
    await expect(editor.getByRole('heading', { name: 'Kopniveau 1 in React editor', level: 1 })).toBeVisible();

    // Check for the initial paragraph content
    await expect(editor.getByText('Dit is een voorbeeld van de Clippy Editor met een Lit React wrapper')).toBeVisible();
  });
});

test.describe('Basic text editing', () => {
  test('can type text in editor', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor').first();
    const editor = clippyEditor.getByRole('textbox');

    // Click into an existing paragraph
    await editor.getByRole('paragraph').first().click();

    // Type some text
    await page.keyboard.type('Test text from React');

    // Verify the text appears
    await expect(editor.getByText('Test text from React')).toBeVisible();
  });

  test('can toggle bold formatting', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor').first();
    const editor = clippyEditor.getByRole('textbox');

    // Click into paragraph and type
    await editor.getByRole('paragraph').first().click();
    await page.keyboard.type('bold text');

    // Select the text
    const textNode = editor.getByText('bold text');
    await textNode.click({ clickCount: 3 });

    // Click bold button
    const boldButton = clippyEditor.getByRole('button', { name: 'Vetgedrukt' });
    await boldButton.click();

    // Verify bold is active
    await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
  });
});
