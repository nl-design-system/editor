import { defineConfig, type Plugin } from 'vite';
import { generateModule, moduleOut } from './src/build/generate-module.ts';

function copyModuleAssets(): Plugin {
  return {
    name: 'copy-module-assets',
    closeBundle: generateModule,
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
    outDir: moduleOut,
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
