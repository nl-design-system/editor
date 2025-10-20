import litCss from 'vite-plugin-lit-css';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [litCss()],
  test: {
    browser: {
      enabled: true,
      headless: false,
      instances: [{ browser: 'chromium' }],
      provider: 'playwright',
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
    exclude: ['**/e2e/**'],
  },
});
