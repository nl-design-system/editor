import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const moduleOut = resolve(import.meta.dirname, '../../app/drupal/modules/clippy');

function copyYmlFiles(): Plugin {
  return {
    name: 'copy-yml-files',
    closeBundle() {
      mkdirSync(moduleOut, { recursive: true });
      for (const file of ['clippy.ckeditor5.yml', 'clippy.info.yml', 'clippy.libraries.yml']) {
        copyFileSync(resolve(import.meta.dirname, file), resolve(moduleOut, file));
      }
    },
  };
}

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      name: 'clippyCkeditor',
      cssFileName: 'clippy',
      entry: 'src/index.ts',
      formats: ['iife'],
    },
    outDir: resolve(moduleOut, 'dist'),
    rollupOptions: {
      // ckeditor5 is provided by Drupal's webpack DLL at runtime.
      external: ['ckeditor5'],
      output: {
        entryFileNames: 'clippy.js',
        // Register on globalThis.CKEditor5.clippyCkeditor so Drupal can find
        // the plugin via the `clippyCkeditor.ClippyPlugin` reference in
        // clippy.ckeditor5.yml.
        footer: '(globalThis.CKEditor5 = globalThis.CKEditor5 || {}).clippyCkeditor = clippyCkeditor;',
        globals: {
          ckeditor5: "globalThis.CKEditor5.dll('./src/core.js')",
        },
      },
    },
  },
  plugins: [copyYmlFiles()],
});
