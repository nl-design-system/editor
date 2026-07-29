import { defineConfig } from 'vite';
import alias from './vite.alias';

// Builds the popup (an HTML entry point). Static files in `public/` — notably
// `manifest.json` — are copied to `dist/` verbatim. `base: './'` keeps asset
// URLs relative so they resolve under the `chrome-extension://` origin.
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html',
      },
    },
    target: 'chrome110',
  },
  resolve: {
    ...alias,
  },
});
