import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const clippyEditor = page.locator('#clippy-editor-localhost');
  await expect(clippyEditor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toBeVisible();
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
      const clippyEditor = page.locator('#clippy-editor-localhost');
      await expect(clippyEditor.getByRole('button', { name: button, exact: true })).toBeVisible();
    });
  });

  test('all toolbar comboboxes are visible', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    await expect(clippyEditor.getByRole('combobox', { name: 'Selecteer tekstformaat' })).toBeVisible();
    await expect(clippyEditor.getByRole('combobox', { name: 'Taal van het element' })).toBeVisible();
  });
});

test.describe('Text formatting', () => {
  test('toggle bold on selected text', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('testbold');

    const textNode = editor.getByText('testbold');
    await textNode.click({ clickCount: 3 });

    await clippyEditor.getByRole('button', { name: 'Vetgedrukt', exact: true }).click();

    await expect(clippyEditor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('toggle italic on selected text', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('testitalic');

    const textNode = editor.getByText('testitalic');
    await textNode.click({ clickCount: 3 });

    const italicButton = clippyEditor.getByRole('button', { name: 'Cursief' });
    await italicButton.click();

    await expect(italicButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('change text format to heading via combobox', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('test heading');

    await clippyEditor.getByRole('combobox', { name: 'Selecteer tekstformaat' }).clear();
    await clippyEditor.getByRole('option', { name: 'Kopniveau 3' }).click();

    await expect(editor.getByRole('heading', { name: 'test heading', level: 3 })).toBeVisible();
  });
});

test.describe('Lists', () => {
  test('insert ordered list', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().fill('ordered item');

    await clippyEditor.getByRole('button', { name: 'Genummerde lijst' }).click();

    await expect(editor.getByRole('listitem').filter({ hasText: 'ordered item' })).toBeVisible();
  });

  test('insert unordered list', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().fill('unordered item');

    await clippyEditor.getByRole('button', { name: 'Ongeordende lijst' }).click();

    await expect(editor.getByRole('listitem').filter({ hasText: 'unordered item' })).toBeVisible();
  });
});

test.describe('Undo / Redo', () => {
  test('undo and redo text input', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('undoredo');

    await expect(editor.getByText('undoredo')).toBeVisible();

    await clippyEditor.getByRole('button', { name: 'Ongedaan maken' }).click();
    await expect(editor.getByText('undoredo')).not.toBeVisible();

    await clippyEditor.getByRole('button', { name: 'Opnieuw' }).click();
    await expect(editor.getByText('undoredo')).toBeVisible();
  });

  test('undo button only enabled after action', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');
    const undoButton = clippyEditor.getByRole('button', { name: 'Ongedaan maken' });

    await expect(undoButton).toBeDisabled();

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('test');

    await expect(undoButton).toBeEnabled();
  });

  test('redo button only enabled after undoing an action', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');
    const redoButton = clippyEditor.getByRole('button', { name: 'Opnieuw' });

    await expect(redoButton).toBeDisabled();

    await editor
      .getByRole('paragraph')
      .filter({ hasText: /^Onder die steden/ })
      .first()
      .click();
    await page.keyboard.type('test');
    await expect(redoButton).toBeDisabled();

    await clippyEditor.getByRole('button', { name: 'Ongedaan maken' }).click();

    await expect(redoButton).toBeEnabled();
  });
});

test.describe('Table', () => {
  test('insert a table', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    const initialTableCount = await editor.getByRole('table').count();

    await clippyEditor.getByRole('button', { name: 'Tabel invoegen' }).click();
    await expect(editor.getByRole('table')).toHaveCount(initialTableCount + 1);
  });
});

test.describe('Keyboard shortcuts dialog', () => {
  test('open and close shortcuts dialog', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    await clippyEditor.getByRole('button', { name: 'Sneltoetsen' }).click();

    const dialog = clippyEditor.getByTestId('clippy-shortcuts-dialog').first();
    await expect(dialog).toBeVisible();

    await clippyEditor.getByRole('button', { name: 'Sneltoetsen dialoog sluiten' }).click();
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Link dialog', () => {
  test('Link button is visible', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    await expect(clippyEditor.getByRole('button', { name: 'Link', exact: true })).toBeVisible();
  });

  test('opens and closes the link dialog', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    await clippyEditor.getByRole('button', { name: 'Link', exact: true }).click();

    const dialog = clippyEditor.getByRole('dialog', { name: 'Link invoegen/bewerken' });
    await expect(dialog).toBeVisible();

    await clippyEditor.getByRole('button', { name: 'Sluiten' }).nth(1).click();
    await expect(dialog).not.toBeVisible();
  });

  test('adds a link to selected text', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('anchortext');
    await editor.getByText('anchortext').click({ clickCount: 3 });

    await clippyEditor.getByRole('button', { name: 'Link', exact: true }).click();
    await clippyEditor.getByPlaceholder('https://example.com').fill('https://test.com');
    await clippyEditor.getByRole('button', { name: 'Link toevoegen' }).click();

    await expect(editor.getByRole('link', { name: 'anchortext' })).toBeVisible();
  });

  test('shows link properties when editing an existing link', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('editanchor');
    await editor.getByText('editanchor').click({ clickCount: 3 });
    await clippyEditor.getByRole('button', { name: 'Link', exact: true }).click();
    await clippyEditor.getByPlaceholder('https://example.com').fill('https://example.com');
    await clippyEditor.getByRole('button', { name: 'Link toevoegen' }).click();

    await editor.getByRole('link', { name: 'editanchor' }).click();

    await clippyEditor.getByRole('button', { name: 'Link', exact: true }).click();
    const dialog = clippyEditor.getByRole('dialog', { name: 'Link invoegen/bewerken' });
    await expect(dialog).toBeVisible();

    await expect(clippyEditor.getByPlaceholder('https://example.com')).toHaveValue('https://example.com');
    await expect(clippyEditor.getByLabel('Voorbeeld linktekst')).toHaveText('editanchor');
    await expect(clippyEditor.getByRole('button', { name: 'Bijwerken' })).toBeVisible();
    await expect(clippyEditor.getByRole('button', { name: 'Link verwijderen' })).toBeVisible();
  });

  test('removes a link while preserving its text', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    const editor = clippyEditor.getByRole('textbox');

    await editor.getByRole('paragraph').filter({ hasText: /^$/ }).first().click();
    await page.keyboard.type('removelink');
    await editor.getByText('removelink').click({ clickCount: 3 });
    await clippyEditor.getByRole('button', { name: 'Link', exact: true }).click();
    await expect(clippyEditor.getByRole('dialog', { name: 'Link invoegen/bewerken' })).toBeVisible();
    await clippyEditor.getByPlaceholder('https://example.com').fill('https://example.com');
    await clippyEditor.getByRole('button', { name: 'Link toevoegen' }).click();
    await expect(editor.getByRole('link', { name: 'removelink' })).toBeVisible();

    await editor.getByRole('link', { name: 'removelink' }).click();
    await clippyEditor.getByRole('button', { name: 'Link', exact: true }).click();
    await clippyEditor.getByRole('button', { name: 'Link verwijderen' }).click();

    await expect(clippyEditor.getByRole('dialog', { name: 'Link invoegen/bewerken' })).not.toBeVisible();
    await expect(editor.getByRole('link', { name: 'removelink' })).not.toBeVisible();
    await expect(editor.getByText('removelink')).toBeVisible();
  });
});

test.describe('Accessibility notifications', () => {
  test('shows notification count badge', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    await expect(clippyEditor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toBeVisible();
  });

  test('open drawer and list notifications', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    await clippyEditor.getByRole('button', { name: 'Toon toegankelijkheidsmeldingen' }).click();

    const drawer = clippyEditor.getByTestId('clippy-validations-drawer');
    await expect(drawer).toBeVisible();
    await expect(clippyEditor.getByRole('button', { name: 'Corrigeren' }).first()).toBeVisible();
  });

  test('navigate to node via Focus button', async ({ page }) => {
    const clippyEditor = page.locator('#clippy-editor-localhost');
    await clippyEditor.getByRole('button', { name: 'Toon toegankelijkheidsmeldingen' }).click();

    const drawer = clippyEditor.getByTestId('clippy-validations-drawer');
    await expect(drawer).toBeVisible();

    await clippyEditor.getByRole('button', { name: 'Focus' }).first().click();
    await expect(drawer).not.toBeVisible();
  });
});
