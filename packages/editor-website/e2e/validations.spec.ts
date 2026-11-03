import { expect, test } from '@playwright/test';
import { ruleAnchor } from '../src/utils/ruleAnchor.ts';
import { validationGroups } from '../src/utils/validationGroups.ts';

test.describe('Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/validaties');
  });

  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Validaties - Rich-text Editor - NL Design System');
  });

  test('page has document language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });

  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Validaties', level: 1 })).toBeVisible();
  });

  test('Validaties nav link is active', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    await expect(page.getByRole('link', { name: 'Validaties', exact: true }).filter({ visible: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('lists every core validation', async ({ page }) => {
    const rules = validationGroups.flatMap(({ rules }) => rules);
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(rules.length + 1);
  });

  test('links a validation to its card', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'IMAGE_MUST_HAVE_ALT_TEXT' });
    await expect(row.getByRole('link')).toHaveAttribute('href', '/validaties/afbeelding#image-must-have-alt-text');
  });
});

test.describe('Component pages', () => {
  for (const { label, rules, slug } of validationGroups) {
    test.describe(label.nl, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/validaties/${slug.nl}`);
      });

      test('page heading and navigation link are present', async ({ page }) => {
        await expect(page.getByRole('heading', { name: label.nl, exact: true, level: 1 })).toBeVisible();
        const menuButton = page.getByRole('button', { name: 'Menu', exact: true });
        if (await menuButton.isVisible()) {
          await menuButton.click();
        }
        await expect(page.getByRole('link', { name: label.nl, exact: true }).filter({ visible: true })).toHaveAttribute(
          'aria-current',
          'page',
        );
      });

      for (const { rule } of rules) {
        test(`${rule} example shows its validation`, async ({ page }) => {
          const card = page.locator(`#${ruleAnchor(rule)}`);
          await expect(card.getByText(rule, { exact: true })).toBeVisible();
          await expect(card.locator('.clippy-validation__title')).toBeVisible();
          await expect(
            card.locator('clippy-validations-gutter .clippy-validations-gutter__indicator').first(),
          ).toBeVisible();
          await expect(card.locator('clippy-validations-list clippy-validation-item').first()).toBeAttached();
        });
      }
    });
  }
});

test.describe('English component page', () => {
  test('shows the rules of the component', async ({ page }) => {
    await page.goto('/en/validations/heading');
    await expect(page.getByRole('heading', { name: 'Heading', exact: true, level: 1 })).toBeVisible();
    await expect(page.locator('#heading-must-not-be-empty clippy-validations-list clippy-validation-item')).toHaveCount(
      1,
    );
  });
});
