import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/richtlijnen');
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

/**
 * Each guideline editor enables exactly one validation rule via `enable-rules`.
 * The expected indicator count is derived from the content and the rule's behaviour:
 *
 * - Block validators (`node-should-not-be-empty`) fire per matching element in a
 *   depth-first DOM walk.  TipTap wraps list-item / table-cell content in a `<p>`,
 *   so an empty `<li>` becomes `<li><p></p></li>` — both `li` and `p` are flagged.
 * - Inline validators fire per inline element.
 * - Document validators query the full document and return an array of results.
 */
test.describe('Gutter indicators', () => {
  const gutterGuidelines: Array<{ id: string; title: string; expectedIndicators: number }> = [
    // node-should-not-be-empty: 1 empty <p>
    { id: 'editor-1', expectedIndicators: 1, title: 'lege alinea' },
    // inline-should-not-be-empty: 8 empty inline elements (b, a, u, strong, mark, em, s, i)
    { id: 'editor-2', expectedIndicators: 8, title: 'lege inline elementen' },
    // inline-should-not-be-underlined: 1 <u> element
    { id: 'editor-3', expectedIndicators: 1, title: 'tekst onderstrepen' },
    // node-should-not-be-empty: 1 empty <li> → <li><p></p></li> = 2 empty nodes
    { id: 'editor-4', expectedIndicators: 2, title: 'lege list items (ul)' },
    // node-should-not-be-empty: 1 empty <li> → <li><p></p></li> = 2 empty nodes
    { id: 'editor-5', expectedIndicators: 2, title: 'lege list items (ol)' },
    // paragraph-should-not-resemble-list: 1 numbered-list paragraph
    { id: 'editor-6', expectedIndicators: 1, title: 'geordende lijst zonder opmaak' },
    // paragraph-should-not-resemble-list: 1 bullet-list paragraph
    { id: 'editor-7', expectedIndicators: 1, title: 'lijst zonder opmaak' },
    // node-should-not-be-empty: 1 empty <dt> + 1 empty <dd>
    { id: 'editor-8', expectedIndicators: 2, title: 'lege Definition List' },
    // node-should-not-be-empty: 3 empty <td> cells, each wraps a <p> = 6 empty nodes
    { id: 'editor-9', expectedIndicators: 6, title: 'lege rij in een tabel' },
    // image-must-have-alt-text: 1 <img> without alt
    { id: 'editor-10', expectedIndicators: 1, title: 'afbeelding zonder alt-tekst' },
    // paragraph-should-not-resemble-heading: 1 bold-only paragraph
    { id: 'editor-11', expectedIndicators: 1, title: 'koptekst zonder opmaak' },
    // document-must-have-correct-heading-order: h1 → h3 (skipped h2)
    { id: 'editor-12', expectedIndicators: 1, title: 'kopniveau overslaan' },
    // table-must-have-headings: 1 table without <th> cells
    { id: 'editor-13', expectedIndicators: 1, title: 'tabel zonder kopcellen' },
    // table-must-have-multiple-rows: 1 single-row table
    { id: 'editor-14', expectedIndicators: 1, title: 'tabel met één rij' },
    // document-must-have-single-heading-one: 2 h1s → 1 extra flagged
    { id: 'editor-15', expectedIndicators: 1, title: 'meer dan 1 hoofdkop' },
    // document-must-have-top-level-heading-one: no h1
    { id: 'editor-16', expectedIndicators: 1, title: 'geen hoofdkop' },
    // definition-description-must-follow-term: <dt> not followed by <dd>
    { id: 'editor-17', expectedIndicators: 1, title: 'definitie zonder term' },
    // description-list-must-contain-term: <dl> without any <dt>
    { id: 'editor-18', expectedIndicators: 1, title: 'definitielijst zonder term' },
    // heading-should-not-contain-bold-or-italic: h1 with <strong>
    { id: 'editor-19', expectedIndicators: 1, title: 'heading met bold' },
    // heading-should-not-contain-bold-or-italic: h1 with <em>
    { id: 'editor-20', expectedIndicators: 1, title: 'heading met italic' },
    // link-should-not-be-too-generic: "klik hier" link
    { id: 'editor-21', expectedIndicators: 1, title: 'onduidelijke linktekst' },
  ];

  for (const { id, expectedIndicators, title } of gutterGuidelines) {
    test(`${id} (${title}) gutter has ${expectedIndicators} indicator(s)`, async ({ page }) => {
      const context = page.locator(`clippy-context#${id}`);
      const indicators = context.locator('clippy-validations-gutter .clippy-validations-gutter__indicator');

      await expect(indicators).toHaveCount(expectedIndicators);
    });
  }

  test('gutter indicator count matches validation list item count for each editor', async ({ page }) => {
    for (const { id } of gutterGuidelines) {
      const context = page.locator(`clippy-context#${id}`);
      const gutterIndicators = context.locator('clippy-validations-gutter .clippy-validations-gutter__indicator');
      const listItems = context.locator('clippy-validations-list clippy-validation-item');

      const gutterCount = await gutterIndicators.count();
      const listCount = await listItems.count();

      expect(gutterCount, `${id}: gutter and list counts should match`).toBe(listCount);
    }
  });
});
