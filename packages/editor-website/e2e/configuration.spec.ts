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
  test('configuration panel and live editor are visible', async ({ page }) => {
    await expect(page.getByLabel('Groep 1', { exact: true })).toBeVisible();
    await expect(page.locator('clippy-editor', { hasText: 'Live configuratie demo' })).toBeVisible();
  });

  test('config snippet shows valid JSON', async ({ page }) => {
    const output = page.locator('output');
    const value = await output.textContent();
    expect(() => JSON.parse(value ?? '')).not.toThrow();
  });

  test('adding a group shows a new group select', async ({ page }) => {
    await page.getByRole('button', { name: 'Groep toevoegen', exact: true }).click();
    await expect(page.getByLabel('Groep 2', { exact: true })).toBeVisible();
  });

  test('selecting bold, italic and underline in a new group updates the JSON output', async ({ page }) => {
    await page.getByRole('button', { name: 'Groep toevoegen', exact: true }).click();
    const newGroup = page.getByLabel('Groep 2', { exact: true });
    await expect(newGroup).toBeVisible();

    await newGroup.selectOption(['bold', 'italic', 'underline']);

    const output = page.locator('output');
    const value = await output.textContent();
    const config = JSON.parse(value ?? '');

    expect(config).toHaveLength(2);
    expect(config[1]).toEqual(['bold', 'italic', 'underline']);
  });

  test('selecting bold, italic and underline in a new group updates the live editor toolbar', async ({ page }) => {
    const liveEditor = page.locator('clippy-editor', { hasText: 'Live configuratie demo' });

    await page.getByRole('button', { name: 'Groep toevoegen', exact: true }).click();
    const newGroup = page.getByLabel('Groep 2', { exact: true });
    await expect(newGroup).toBeVisible();

    await newGroup.selectOption(['bold', 'italic', 'underline']);

    // Both groups contain bold, italic and underline — each button should appear twice in the toolbar
    await expect(liveEditor.getByRole('button', { name: 'Vetgedrukt', exact: true })).toHaveCount(2);
    await expect(liveEditor.getByRole('button', { name: 'Cursief', exact: true })).toHaveCount(2);
    await expect(liveEditor.getByRole('button', { name: 'Onderstrepen', exact: true })).toHaveCount(2);
  });
});
