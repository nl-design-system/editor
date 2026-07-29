import { defineConfig } from 'vite';
import alias from './vite.alias';

// Builds the MV3 service worker as an ES module (manifest declares
// `"type": "module"`). `emptyOutDir: false` preserves the popup build.
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/background.ts',
      fileName: () => 'background.js',
      formats: ['es'],
    },
    outDir: 'dist',
    target: 'chrome110',
  },
  resolve: {
    ...alias,
  },
});
