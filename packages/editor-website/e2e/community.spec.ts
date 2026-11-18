import { expect, test } from './fixtures/axe.ts';

test('has no detectable WCAG 2.2 AA violations', async ({ makeAxeBuilder, page }) => {
  await page.goto('/community');

  const results = await makeAxeBuilder().analyze();

  expect(results.violations).toEqual([]);
});
