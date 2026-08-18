import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import alias from './vite.alias';

/**
 * Each public entry is built in its own single-entry pass so that shared code
 * (e.g. `src/helpers.ts`) is inlined into every output instead of hoisted into
 * a shared chunk. This keeps `dist/index.js` a fully self-contained ES module —
 * the Playwright integration injects that single file into the page, so it must
 * not import sibling chunks. Select the entry with `BUILD_ENTRY`; the default
 * `index` pass cleans `dist`, later passes append to it.
 */
const ENTRIES: Record<string, Record<string, string>> = {
  correctors: { 'correctors/index': 'src/correctors/index.ts' },
  index: { index: 'src/index.ts' },
};

const entry = process.env['BUILD_ENTRY'] ?? 'index';

export default defineConfig({
  build: {
    emptyOutDir: entry === 'index',
    lib: {
      entry: ENTRIES[entry],
      formats: ['es'],
    },
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
