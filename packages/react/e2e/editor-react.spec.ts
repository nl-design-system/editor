import { test, expect } from '@playwright/test';

// The demo page renders two independent editors, each with its own toolbar. Scope
// toolbar/content assertions to the first editor to avoid strict-mode ambiguity.
const firstEditor = (page: import('@playwright/test').Page) => page.locator('#react-editor-1');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(firstEditor(page).getByRole('button', { name: 'Vetgedrukt' })).toBeVisible();
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
  test('toolbar buttons are visible', async ({ page }) => {
    const editor = firstEditor(page);
    await expect(editor.getByRole('button', { name: 'Vetgedrukt' })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Cursief' })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Onderstrepen' })).toBeVisible();
  });

  test('toolbar comboboxes are visible', async ({ page }) => {
    const editor = firstEditor(page);
    await expect(editor.getByRole('combobox').first()).toBeVisible();
    await expect(editor.getByRole('combobox').nth(1)).toBeVisible();
  });

  test('initial content is rendered correctly', async ({ page }) => {
    await expect(
      page.locator('#react-editor-2').getByRole('heading', { name: 'Kopniveau 1 in React editor' }),
    ).toBeVisible();

    // Check for the initial paragraph content
    await expect(page.locator('#react-editor-2').getByRole('paragraph')).toBeVisible();
  });
});

test.describe('Basic text editing', () => {
  test('can type text in editor', async ({ page }) => {
    const editor = firstEditor(page).getByRole('textbox');

    // Click into an existing paragraph
    await editor.getByRole('paragraph').first().click();

    // Type some text
    await page.keyboard.type('Test text from React');

    // Verify the text appears
    await expect(editor.getByText('Test text from React')).toBeVisible();
  });

  test('can toggle bold formatting', async ({ page }) => {
    const editor = firstEditor(page).getByRole('textbox');

    // Click into paragraph and type
    await editor.getByRole('paragraph').first().click();
    await page.keyboard.type('bold text');

    // Select the text
    const textNode = editor.getByText('bold text');
    await textNode.click({ clickCount: 3 });

    // Click bold button
    const boldButton = firstEditor(page).getByRole('button', { name: 'Vetgedrukt' });
    await boldButton.click();

    // Verify bold is active
    await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
  });
});
