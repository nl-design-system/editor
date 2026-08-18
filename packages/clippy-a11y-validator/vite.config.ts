import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';
import alias from './vite.alias';

// One single-entry pass per entry (via BUILD_ENTRY) so shared code is inlined,
// not split into a shared chunk — `dist/index.js` must stay self-contained for
// page injection. `index` cleans dist; later passes append. `tsc` emits the .d.ts.
const ENTRIES: Record<string, Record<string, string>> = {
  correctors: { 'correctors/index': 'src/correctors/index.ts' },
  index: { index: 'src/index.ts' },
  playwright: { 'playwright/index': 'playwright/index.ts' },
};

const entry = process.env['BUILD_ENTRY'] ?? 'index';
const isPlaywright = entry === 'playwright';

// Playwright entry is a thin wrapper — keep peers and Node built-ins external.
const external = [
  '@nl-design-system-community/clippy-a11y-validator',
  '@playwright/test',
  'playwright-core',
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
];

export default defineConfig({
  build: {
    emptyOutDir: entry === 'index',
    lib: {
      entry: ENTRIES[entry],
      formats: ['es'],
    },
    ...(isPlaywright ? { rollupOptions: { external }, target: 'node20' } : {}),
  },
  resolve: {
    ...alias,
  },
});
