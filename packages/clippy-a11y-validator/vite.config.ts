import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';
import alias from './vite.alias';

/**
 * Each public entry is built in its own single-entry pass so that shared code
 * (e.g. `src/helpers.ts`) is inlined into every output instead of hoisted into
 * a shared chunk. This keeps `dist/index.js` a fully self-contained ES module —
 * the Playwright integration injects that single file into the page, so it must
 * not import sibling chunks. Select the entry with `BUILD_ENTRY`; the default
 * `index` pass cleans `dist`, later passes append to it. Declarations are emitted
 * separately by `tsc` (see `build:ts`), so Vite only produces JavaScript here.
 */
const ENTRIES: Record<string, Record<string, string>> = {
  correctors: { 'correctors/index': 'src/correctors/index.ts' },
  index: { index: 'src/index.ts' },
  playwright: { 'playwright/index': 'playwright/index.ts' },
};

const entry = process.env['BUILD_ENTRY'] ?? 'index';
const isPlaywright = entry === 'playwright';

// The Playwright entry is a thin Node-side wrapper: keep the validator core
// (self-referenced by name, resolved at runtime), Playwright, and Node built-ins
// external rather than re-bundling them.
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
