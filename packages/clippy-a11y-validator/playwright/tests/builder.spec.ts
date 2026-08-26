import { expect, test } from '@playwright/test';
import ClippyBuilder, { assertNoValidationItems, countBySeverity, formatValidationItems } from '../index';

/** HTML with several deliberate content-accessibility problems. */
const INACCESSIBLE = `
  <h1></h1>
  <p>Lees <a href="/report">lees meer</a> voor het rapport.</p>
  <img src="chart.png">
`;

/** The same content, corrected. */
const ACCESSIBLE = `
  <h1>Kwartaalrapport</h1>
  <h2>Samenvatting</h2>
  <p>Lees <a href="/report">het volledige kwartaalrapport</a> voor de details.</p>
  <img src="chart.png" alt="Omzet steeg met 12% ten opzichte van vorig kwartaal">
`;

test('reports validationItems found in the live DOM', async ({ page }) => {
  await page.setContent(INACCESSIBLE);

  const results = await new ClippyBuilder({ page }).validate();
  const ids = results.validationItems.map((item) => item.id);

  expect(ids).toContain('heading-must-not-be-empty');
  expect(ids).toContain('image-must-have-alt-text');
  expect(ids).toContain('link-should-not-be-too-generic');
});

test('reports no validationItems for accessible content', async ({ page }) => {
  await page.setContent(ACCESSIBLE);

  const results = await new ClippyBuilder({ page }).validate();

  expect(results.validationItems).toEqual([]);
  expect(countBySeverity(results)).toEqual({ error: 0, info: 0, warning: 0 });
});

test('scopes validation to an included selector', async ({ page }) => {
  await page.setContent(`
    <header><img src="logo.png"></header>
    <main id="content"><h1>Titel</h1><p>Alles goed hier.</p></main>
  `);

  // Without scoping, the alt-less logo in the header is reported.
  const wholePage = await new ClippyBuilder({ page }).validate();
  expect(wholePage.validationItems.map((item) => item.id)).toContain('image-must-have-alt-text');

  // Scoped to #content, the header image is outside the validated root.
  const scoped = await new ClippyBuilder({ page }).include('#content').validate();
  expect(scoped.validationItems).toEqual([]);
});

test('honours enableRules / disableRules', async ({ page }) => {
  await page.setContent(INACCESSIBLE);

  const onlyImages = await new ClippyBuilder({ page }).enableRules(['image-must-have-alt-text']).validate();
  const ids = onlyImages.validationItems.map((item) => item.id);

  expect(ids).toEqual(['image-must-have-alt-text']);

  const withoutImages = await new ClippyBuilder({ page }).disableRules(['image-must-have-alt-text']).validate();
  expect(withoutImages.validationItems.map((item) => item.id)).not.toContain('image-must-have-alt-text');
});

test('formatValidationItems and assertNoValidationItems act as CI gates', async ({ page }) => {
  await page.setContent(INACCESSIBLE);
  const results = await new ClippyBuilder({ page }).validate();

  expect(formatValidationItems(results)).toContain('heading-must-not-be-empty');
  expect(() => assertNoValidationItems(results, { failOn: 'error' })).toThrow();
});
