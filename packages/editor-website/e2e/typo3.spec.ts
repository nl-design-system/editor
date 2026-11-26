import { expect, test } from './fixtures/axe.ts';

test('has no detectable WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/hulpmiddelen/typo3');

  await expect(page).not.toHaveAutoDetectableA11yIssues();
});
