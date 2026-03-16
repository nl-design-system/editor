import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/react');
  // Wait for the React components to hydrate (client:only) — scope to the custom element tag
  await expect(page.locator('clippy-editor#react-editor-1')).toBeVisible();
  await expect(
    page.locator('clippy-editor#react-editor-1').getByRole('button', { name: 'Vetgedrukt', exact: true }),
  ).toBeVisible();
});

test.describe('Page basics', () => {
  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('React integratie - Rich-text Editor - NL Design System');
  });

  test('page has document language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });

  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'React integratie', level: 1 })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('React nav link is active on the react page', async ({ page }) => {
    await expect(
      page.locator('.ma-site-header__nav').getByRole('link', { name: 'React', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Voorbeeld 1: ClippyEditor', () => {
  test('editor renders', async ({ page }) => {
    await expect(page.locator('clippy-editor#react-editor-1')).toBeVisible();
  });

  test('toolbar buttons are visible', async ({ page }) => {
    const editor = page.locator('clippy-editor#react-editor-1');
    await expect(editor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Cursief', exact: true })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Onderstrepen', exact: true })).toBeVisible();
  });

  test('initial content is present', async ({ page }) => {
    const editor = page.locator('clippy-editor#react-editor-1');
    await expect(editor.getByRole('textbox').getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('can type text', async ({ page }) => {
    const editor = page.locator('clippy-editor#react-editor-1');
    const textbox = editor.getByRole('textbox');

    await textbox.getByRole('heading', { level: 1 }).click();
    await page.keyboard.press('End');
    await page.keyboard.type(' react test');

    await expect(textbox.getByRole('heading', { level: 1 })).toContainText('react test');
  });

  test('can toggle bold', async ({ page }) => {
    const editor = page.locator('clippy-editor#react-editor-1');
    const textbox = editor.getByRole('textbox');

    await textbox.getByRole('paragraph').first().click();
    await page.keyboard.type('react bold');
    await textbox.getByText('react bold').click({ clickCount: 3 });

    await editor.getByRole('button', { name: 'Vetgedrukt', exact: true }).click();

    await expect(editor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  // ...existing code...

  test('code example for ClippyEditor is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Voorbeeld 1: eenvoudige editor', level: 2 })).toBeVisible();
    await expect(page.getByText("from '@nl-design-system-community/editor-react'").first()).toBeVisible();
  });
});

test.describe('Voorbeeld 2: ClippyContext', () => {
  test('context editor renders', async ({ page }) => {
    await expect(page.locator('clippy-context#react-editor-2')).toBeVisible();
  });

  test('code example for ClippyContext is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Voorbeeld 2: context, content, gutter en validaties', level: 2 }),
    ).toBeVisible();
    await expect(page.getByText('ClippyContext').first()).toBeVisible();
  });
});
