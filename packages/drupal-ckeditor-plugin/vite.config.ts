import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const moduleOut = resolve(import.meta.dirname, '../../app/drupal/modules/clippy');

// TEMP: tokens bundled into the module so the drupal demo is self-contained.
const editorRequire = createRequire(resolve(import.meta.dirname, '../editor/package.json'));
const TOKENS_CSS = [
  '@nl-design-system-community/ma-design-tokens/dist/theme.css',
  '@utrecht/design-tokens/dist/theme.css',
  '@nl-design-system-candidate/button-css/button.css',
];

function copyModuleAssets(): Plugin {
  return {
    name: 'copy-module-assets',
    closeBundle() {
      mkdirSync(moduleOut, { recursive: true });
      for (const file of ['clippy.ckeditor5.yml', 'clippy.info.yml', 'clippy.libraries.yml']) {
        copyFileSync(resolve(import.meta.dirname, file), resolve(moduleOut, file));
      }
      // Ship the editor's clippy theme tokens (--clippy-*) as the module stylesheet.
      copyFileSync(resolve(import.meta.dirname, '../editor/theme.css'), resolve(moduleOut, 'dist/clippy.css'));

      // TEMP - inject tokens from --basis / --utrecht --nl; to be discussed
      const tokenString = TOKENS_CSS.map((spec) => readFileSync(editorRequire.resolve(spec), 'utf8')).join('\n');
      writeFileSync(resolve(moduleOut, 'dist/clippy-tokens.css'), tokenString);
    },
  };
}

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      name: 'clippyCkeditor',
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
          // Drupal's DLL has no umbrella entry, so merge core (`Plugin`) and ui
          // (`View`), giving us the ui exports needed to register new
          // functionality like the accessibility-notifications toolbar button.
          ckeditor5:
            "Object.assign({}, globalThis.CKEditor5.dll('./src/core.js'), globalThis.CKEditor5.dll('./src/ui.js'))",
        },
      },
    },
  },
  plugins: [copyModuleAssets()],
});
