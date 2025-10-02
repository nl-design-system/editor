import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: 'playwright',
    },
  },
});
