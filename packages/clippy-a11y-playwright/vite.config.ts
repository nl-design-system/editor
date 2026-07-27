import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import alias from './vite.alias';

// Node-side library: the validator, Playwright and Node built-ins stay external
// so the plugin ships as a thin wrapper rather than re-bundling its peers.
const external = [
  '@nl-design-system-community/clippy-a11y-validator',
  '@playwright/test',
  'playwright-core',
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
];

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external,
    },
    target: 'node20',
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  resolve: {
    ...alias,
  },
});
