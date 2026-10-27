import { expect, test, type Page } from '@playwright/test';

const trigger = (page: Page) => page.locator('clippy-accessibility-notifications');

const issueCount = (page: Page) => trigger(page).locator('[aria-live]');

const drawer = (page: Page) => page.getByTestId('clippy-validations-drawer');

const items = (page: Page) => drawer(page).locator('clippy-validation-item');

const openOverview = async (page: Page, name: RegExp | string) => {
  await page.getByRole('button', { name: 'Toon toegankelijkheidsmeldingen' }).click();
  await page.getByRole('button', { name, exact: true }).click();
};

test.describe('Page review on the preview page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
    await expect(page.locator('.preview-header__review clippy-accessibility-notifications')).toBeVisible();
  });

  test('the trigger counts the known issues in the demo content', async ({ page }) => {
    // The preview runs every core validation. The demo content triggers:
    //   - heading-level-must-not-skip: h1 → h3 (skipped h2)
    //   - heading-must-not-be-empty: empty <h2>
    //   - paragraph-should-not-resemble-list: "1 - Eerste item …"
    await expect(issueCount(page)).toHaveText('Totaal 3 toegankelijkheidsmeldingen gevonden.');
  });

  test('the gutter shows an indicator for each known issue without opening the drawer', async ({ page }) => {
    const indicators = page.locator('main clippy-validations-gutter .clippy-validations-gutter__indicator');
    await expect(issueCount(page)).toHaveText('Totaal 3 toegankelijkheidsmeldingen gevonden.');
    await expect(indicators).toHaveCount(3);

    await openOverview(page, /^Fouten, waarschuwingen en tips/);
    await page.keyboard.press('Escape');
    await expect(indicators).toHaveCount(3);
  });

  test('the drawer lists the issues', async ({ page }) => {
    await openOverview(page, /^Fouten, waarschuwingen en tips/);

    await expect(drawer(page)).toBeVisible();
    await expect(items(page)).toHaveCount(3);
    await expect(items(page).locator('.clippy-validation-item-actions').getByRole('button')).toHaveCount(3);
  });

  test('reopening the drawer includes content added to main after load', async ({ page }) => {
    await expect(issueCount(page)).toHaveText('Totaal 3 toegankelijkheidsmeldingen gevonden.');

    await page.locator('main').evaluate((main) => main.insertAdjacentHTML('beforeend', '<h2></h2>'));
    await openOverview(page, /^Fouten, waarschuwingen en tips/);

    await expect(items(page)).toHaveCount(4);
    await expect(issueCount(page)).toHaveText('Totaal 4 toegankelijkheidsmeldingen gevonden.');
  });
});

test('Page review falls back to the body when the page has no main', async ({ page }) => {
  await page.route('**/preview', async (route) => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace('<main', '<div')
      .replace('</main>', '</div>')
      .replace('</header>', '</header><p></p>');
    await route.fulfill({ body, response });
  });

  await page.goto('/preview');

  await expect(issueCount(page)).toHaveText('Totaal 4 toegankelijkheidsmeldingen gevonden.');
});
