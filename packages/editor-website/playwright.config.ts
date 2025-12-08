import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  // @ts-expect-error process.env.CI
  forbidOnly: !!process.env.CI,
  outputDir: 'tmp/test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['html', { outputFolder: 'tmp/playwright-report' }]],
  testDir: './e2e',
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:5174',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm run dev',
    // @ts-expect-error process.env.CI
    reuseExistingServer: !process.env.CI,
    url: 'http://localhost:5174',
  },

  /* Opt out of parallel tests on CI. */
  // @ts-expect-error process.env.CI
  workers: process.env.CI ? 1 : undefined,
});
