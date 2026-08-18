import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ClippyBuilder, { assertNoViolations, formatViolations } from '../index';

const fixture = fileURLToPath(new URL('./fixture.html', import.meta.url));

/**
 * End-to-end example: analyze rendered editor output and fail the test when any
 * error-level accessibility issue is present.
 *
 * In a real project you would replace the `setContent` call with a navigation
 * to the page that renders your editor output, e.g.:
 *
 *   await page.goto('http://localhost:5173/preview');
 */
test('published editor content has no accessibility errors', async ({ page }) => {
  await page.setContent(await readFile(fixture, 'utf8'));

  const results = await new ClippyBuilder({ page })
    .include('.clippy-content') // only audit the editor's content region
    .analyze();

  // A readable report is printed when the assertion below fails.
  console.info(formatViolations(results));

  // Gate the build: throws (failing the test) on any error-level violation.
  assertNoViolations(results, { failOn: 'error' });

  expect(results.violations).toEqual([]);
});
