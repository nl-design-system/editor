import { defineConfig, devices } from '@playwright/test';

// The suites drive the page with `page.setContent()`, so no dev/web server is
// needed. Both the plugin's own tests and the documented examples run here.
export default defineConfig({
  forbidOnly: !!process.env['CI'],
  fullyParallel: true,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: 'list',
  testDir: './playwright',
  testMatch: ['tests/**/*.spec.ts', 'examples/**/*.spec.ts'],
});
