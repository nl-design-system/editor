import { defineConfig } from 'vite';
import alias from './vite.alias';

// Builds the in-page script as a single self-contained IIFE (the validator is
// inlined). Programmatically-injected scripts run as classic scripts, so they
// must not use ESM `import`. `emptyOutDir: false` preserves the popup build.
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      name: 'clippyA11yInject',
      entry: 'src/inject.ts',
      fileName: () => 'inject.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    target: 'chrome110',
  },
  resolve: {
    ...alias,
  },
});
