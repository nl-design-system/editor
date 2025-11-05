import { playwright } from '@vitest/browser-playwright';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import alias from './vite.alias';

export default defineConfig({
  resolve: {
    ...alias,
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright(),
      screenshotDirectory: 'tmp/screenshots',
      viewport: { height: 1280, width: 1024 },
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
    exclude: ['**/e2e/**', '**/node_modules/**'],
    include: ['**/src/**/*.test.ts'],
  },
});
