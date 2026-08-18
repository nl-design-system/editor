import { expect, test } from '@playwright/test';
import ClippyBuilder, { assertNoViolations, countBySeverity, formatViolations } from '../index';

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

test('reports violations found in the live DOM', async ({ page }) => {
  await page.setContent(INACCESSIBLE);

  const results = await new ClippyBuilder({ page }).analyze();
  const ids = results.violations.map((violation) => violation.id);

  expect(ids).toContain('heading-must-not-be-empty');
  expect(ids).toContain('image-must-have-alt-text');
  expect(ids).toContain('link-should-not-be-too-generic');
});

test('reports no violations for accessible content', async ({ page }) => {
  await page.setContent(ACCESSIBLE);

  const results = await new ClippyBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
  expect(countBySeverity(results)).toEqual({ error: 0, info: 0, warning: 0 });
});

test('scopes analysis to an included selector', async ({ page }) => {
  await page.setContent(`
    <header><img src="logo.png"></header>
    <main id="content"><h1>Titel</h1><p>Alles goed hier.</p></main>
  `);

  // Without scoping, the alt-less logo in the header is reported.
  const wholePage = await new ClippyBuilder({ page }).analyze();
  expect(wholePage.violations.map((violation) => violation.id)).toContain('image-must-have-alt-text');

  // Scoped to #content, the header image is outside the analyzed root.
  const scoped = await new ClippyBuilder({ page }).include('#content').analyze();
  expect(scoped.violations).toEqual([]);
});

test('honours enableRules / disableRules', async ({ page }) => {
  await page.setContent(INACCESSIBLE);

  const onlyImages = await new ClippyBuilder({ page }).enableRules(['image-must-have-alt-text']).analyze();
  const ids = onlyImages.violations.map((violation) => violation.id);

  expect(ids).toEqual(['image-must-have-alt-text']);

  const withoutImages = await new ClippyBuilder({ page }).disableRules(['image-must-have-alt-text']).analyze();
  expect(withoutImages.violations.map((violation) => violation.id)).not.toContain('image-must-have-alt-text');
});

test('formatViolations and assertNoViolations act as CI gates', async ({ page }) => {
  await page.setContent(INACCESSIBLE);
  const results = await new ClippyBuilder({ page }).analyze();

  expect(formatViolations(results)).toContain('heading-must-not-be-empty');
  expect(() => assertNoViolations(results, { failOn: 'error' })).toThrow();
});
