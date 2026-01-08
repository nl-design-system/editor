import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */

  expect: {
    timeout: 5000,
  },
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
  retries: 1,
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5174',
    // @ts-expect-error process.env.CI
    headless: !!process.env.CI,
    screenshot: 'only-on-failure',
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
