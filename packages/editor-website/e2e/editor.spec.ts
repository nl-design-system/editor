import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Vetgedrukt', exact: true }).waitFor();
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

  buttons.forEach((button) => {
    test(`toolbar button "${button}" is visible`, async ({ page }) => {
      await expect(page.getByRole('button', { name: button, exact: true })).toBeVisible();
    });
  });

  test('all toolbar comboboxes are visible', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Selecteer tekstformaat' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Taal van het element' })).toBeVisible();
  });
});

test.describe('Text formatting', () => {
  test('toggle bold on selected text', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    // Click the empty paragraph and type text
    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('testbold');

    // Triple-click to select all text in the paragraph
    const textNode = editor.getByText('testbold');
    await textNode.click({ clickCount: 3 });

    // Click bold button — the editor internally refocuses and applies bold
    await page.getByRole('button', { name: 'Vetgedrukt', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Vetgedrukt', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('toggle italic on selected text', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('testitalic');

    const textNode = editor.getByText('testitalic');
    await textNode.click({ clickCount: 3 });

    const italicButton = page.getByRole('button', { name: 'Cursief' });
    await italicButton.click();

    await expect(italicButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('change text format to heading via combobox', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('test heading');

    await page.getByRole('combobox', { name: 'Selecteer tekstformaat' }).clear();
    await page.getByRole('option', { name: 'Kopniveau 3' }).click();

    await expect(editor.getByRole('heading', { name: 'test heading', level: 3 })).toBeVisible();
  });
});

test.describe('Lists', () => {
  test('insert ordered list', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    // Fill text in the empty paragraph
    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().fill('ordered item');

    // Click the numbered list button
    await page.getByRole('button', { name: 'Genummerde lijst' }).click();

    await expect(editor.getByRole('listitem').filter({ hasText: 'ordered item' })).toBeVisible();
  });

  test('insert unordered list', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().fill('unordered item');

    await page.getByRole('button', { name: 'Ongeordende lijst' }).click();

    await expect(editor.getByRole('listitem').filter({ hasText: 'unordered item' })).toBeVisible();
  });
});

test.describe('Undo / Redo', () => {
  test('undo and redo text input', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('undoredo');

    await expect(editor.getByText('undoredo')).toBeVisible();

    await page.getByRole('button', { name: 'Ongedaan maken' }).click();
    await expect(editor.getByText('undoredo')).not.toBeVisible();

    await page.getByRole('button', { name: 'Opnieuw' }).click();
    await expect(editor.getByText('undoredo')).toBeVisible();
  });

  test('undo button only enabled after action', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');
    const undoButton = page.getByRole('button', { name: 'Ongedaan maken' });

    await expect(undoButton).toBeDisabled();

    // Type text in editor
    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('test');

    await expect(undoButton).toBeEnabled();
  });

  test('redo button only enabled after undoing an action', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');
    const redoButton = page.getByRole('button', { name: 'Opnieuw' });

    await expect(redoButton).toBeDisabled();

    // Type text and undo to create redo history
    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('test');
    await expect(redoButton).toBeDisabled();

    await page.getByRole('button', { name: 'Ongedaan maken' }).click();

    await expect(redoButton).toBeEnabled();
  });
});

test.describe('Table', () => {
  test('insert a table', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

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

test.describe('Link dialog', () => {
  test('Link button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Link', exact: true })).toBeVisible();
  });

  test('opens and closes the link dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Link', exact: true }).click();

    const dialog = page.getByRole('dialog', { name: 'Link invoegen/bewerken' });
    await expect(dialog).toBeVisible();

    await page.getByRole('button', { name: 'Sluiten' }).nth(1).click();
    await expect(dialog).not.toBeVisible();
  });

  test('adds a link to selected text', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    // Type text in the empty paragraph so triple-click selects only our text
    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('anchortext');
    await editor.getByText('anchortext').click({ clickCount: 3 });

    // Open link dialog and add a URL
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    await page.getByPlaceholder('https://example.com').fill('https://test.com');
    await page.getByRole('button', { name: 'Link toevoegen' }).click();

    await expect(editor.getByRole('link', { name: 'anchortext' })).toBeVisible();
  });

  test('shows link properties when editing an existing link', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    // Create a link in the empty paragraph
    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('editanchor');
    await editor.getByText('editanchor').click({ clickCount: 3 });
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    await page.getByPlaceholder('https://example.com').fill('https://example.com');
    await page.getByRole('button', { name: 'Link toevoegen' }).click();

    // Click the link to position cursor in it
    await editor.getByRole('link', { name: 'editanchor' }).click();

    // Re-open the link dialog
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Link invoegen/bewerken' });
    await expect(dialog).toBeVisible();

    // Verify the dialog is populated with link properties
    await expect(page.getByPlaceholder('https://example.com')).toHaveValue('https://example.com');
    await expect(page.getByLabel('Voorbeeld linktekst')).toHaveText('editanchor');
    await expect(page.getByRole('button', { name: 'Bijwerken' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Link verwijderen' })).toBeVisible();
  });

  test('removes a link while preserving its text', async ({ page }) => {
    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    // Create a link in the empty paragraph
    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('removelink');
    await editor.getByText('removelink').click({ clickCount: 3 });
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Link invoegen/bewerken' })).toBeVisible();
    await page.getByPlaceholder('https://example.com').fill('https://example.com');
    await page.getByRole('button', { name: 'Link toevoegen' }).click();
    await expect(editor.getByRole('link', { name: 'removelink' })).toBeVisible();

    // Click the link and remove it via the dialog
    await editor.getByRole('link', { name: 'removelink' }).click();
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    await page.getByRole('button', { name: 'Link verwijderen' }).click();

    // Dialog closes, link is gone, but text remains
    await expect(page.getByRole('dialog', { name: 'Link invoegen/bewerken' })).not.toBeVisible();
    await expect(editor.getByRole('link', { name: 'removelink' })).not.toBeVisible();
    await expect(editor.getByText('removelink')).toBeVisible();
  });
});

test.describe('Accessibility notifications', () => {
  test('shows notification count badge', async ({ page }) => {
    await expect(page.getByText('4 toegankelijkheidsmeldingen', { exact: true })).toBeVisible();
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

    const clippyEditor = page.locator('clippy-editor[identifier="clippy-editor-localhost"]');
    const editor = clippyEditor.getByRole('textbox');

    await expect(editor).toBeFocused();
  });
});
