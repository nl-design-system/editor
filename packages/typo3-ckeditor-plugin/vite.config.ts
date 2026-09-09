import { defineConfig, type Plugin } from 'vite';
import { extensionOut, generateExtension } from './scripts/generate-extension.ts';

function copyExtensionAssets(): Plugin {
  return {
    name: 'copy-extension-assets',
    closeBundle: generateExtension,
  };
}

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    outDir: extensionOut,
    rollupOptions: {
      // TYPO3's import map has no `ckeditor5` specifier, so `paths` sends it to our shim,
      // which re-exports the per-package modules the host has already loaded.
      external: ['ckeditor5'],
      output: {
        entryFileNames: 'Resources/Public/JavaScript/clippy.js',
        paths: {
          ckeditor5: '@nl-design-system-community/clippy/ckeditor5.js',
        },
      },
    },
  },
  plugins: [copyExtensionAssets()],
});
