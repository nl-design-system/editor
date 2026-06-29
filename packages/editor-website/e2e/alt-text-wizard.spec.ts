import { expect, test } from '@playwright/test';

test.describe('Alt-text wizard (NL)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alt-tekst-wizard');
    await expect(page.locator('clippy-alt-text-wizard')).toBeVisible();
  });

  test('first question is shown with yes/no radio buttons', async ({ page }) => {
    const wizard = page.locator('clippy-alt-text-wizard');
    await expect(wizard.getByRole('radiogroup')).toBeVisible();
    await expect(wizard.getByRole('radio')).toHaveCount(2);
  });

  test('continue button is disabled until a radio option is selected', async ({ page }) => {
    const wizard = page.locator('clippy-alt-text-wizard');
    const continueButton = wizard.getByRole('button', { name: 'Volgende stap' });
    await expect(continueButton).toBeDisabled();

    await wizard.getByRole('radio').first().click();
    await expect(continueButton).toBeEnabled();
  });

  test('first question has no back button', async ({ page }) => {
    const wizard = page.locator('clippy-alt-text-wizard');
    await expect(wizard.getByRole('button', { name: 'Terug' })).not.toBeVisible();
  });

  test('answering "no" to the first question shows the decorative result', async ({ page }) => {
    const wizard = page.locator('clippy-alt-text-wizard');

    await wizard.getByLabel('Nee').click();
    await wizard.getByRole('button', { name: 'Volgende stap' }).click();

    await expect(
      wizard.getByRole('heading', { name: 'Oplossing voor decoratieve afbeeldingen', level: 3 }),
    ).toBeVisible();
    await expect(wizard.getByRole('status')).toBeVisible();
    await expect(wizard.getByRole('button', { name: 'Opnieuw beginnen' })).toBeVisible();
  });

  test('decision tree diagram is visible', async ({ page }) => {
    await expect(page.locator('.mermaid')).toBeVisible();
  });
});

test.describe('Alt-text wizard (EN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/alt-text-wizard');
    await expect(page.locator('clippy-alt-text-wizard')).toBeVisible();
  });

  test('wizard renders in English', async ({ page }) => {
    const wizard = page.locator('clippy-alt-text-wizard');
    await expect(wizard.getByRole('button', { name: 'Next step' })).toBeVisible();
  });

  test('answering "no" shows a result in English', async ({ page }) => {
    const wizard = page.locator('clippy-alt-text-wizard');

    await wizard.getByLabel('No').click();
    await wizard.getByRole('button', { name: 'Next step' }).click();

    await expect(wizard.getByRole('heading', { name: 'Solution for decorative images', level: 3 })).toBeVisible();
    await expect(wizard.getByRole('button', { name: 'Start over' })).toBeVisible();
  });
});
