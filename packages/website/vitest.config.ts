import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: 'playwright',
      screenshotDirectory: 'tmp/screenshots',
    },
    coverage: {
      exclude: [
        'src/main.tsx',
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
