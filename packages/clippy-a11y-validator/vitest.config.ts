import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: 'chromium' }],
            provider: playwright(),
          },
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'cli',
          environment: 'node',
          include: ['cli/**/*.test.ts'],
        },
      },
    ],
  },
});
