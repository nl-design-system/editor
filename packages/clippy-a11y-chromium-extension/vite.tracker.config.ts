import { defineConfig } from 'vite';
import alias from './vite.alias';

// Builds the always-on content script as a classic IIFE (content scripts cannot
// be ES modules). `emptyOutDir: false` preserves the popup build.
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      name: 'clippyA11yTracker',
      entry: 'src/tracker.ts',
      fileName: () => 'tracker.js',
      formats: ['iife'],
    },
    outDir: 'dist',
    target: 'chrome110',
  },
  resolve: {
    ...alias,
  },
});
