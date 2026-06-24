import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/preview');
  await expect(page.locator('clippy-context#clippy-preview')).toBeVisible();
});

test.describe('Gutter indicators on preview page', () => {
  test('preview gutter renders validation indicators', async ({ page }) => {
    const indicators = page.locator('clippy-validations-gutter .clippy-validations-gutter__indicator');

    // All validators are active (enableRules defaults to ['*']).
    // The preview content triggers:
    //   - document-must-have-correct-heading-order: h1 → h3 (skipped h2)
    //   - heading-must-not-be-empty: empty <h2>
    //   - paragraph-should-not-resemble-list: "1 - Eerste item …"
    await expect(indicators).toHaveCount(3);
  });
});
