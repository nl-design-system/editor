import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: 'playwright',
      screenshotDirectory: 'tmp/screenshots',
      viewport: { height: 800, width: 610 },
    },
    coverage: {
      exclude: [
        'src/main.ts',
        '**/vendor/**',
        'playwright.config.ts',
        '**/*.css.ts',
        ...coverageConfigDefaults.exclude,
      ],
      thresholds: {
        branches: 80,
        lines: 80,
        statements: 80,
      },
    },
    exclude: ['**/e2e/**'],
  },
});
