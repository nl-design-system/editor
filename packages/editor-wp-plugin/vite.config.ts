import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      /**
       * WordPress loads scripts with a plain <script> tag (no type="module"),
       * so we must output an IIFE instead of an ES module.
       *
       * Rollup will:
       *  - bundle Lit, TipTap, @lit/context, etc. inline
       *  - replace every `@wordpress/*` import with a reference to the
       *    corresponding `wp.*` global that Gutenberg exposes at runtime
       */
      formats: ['iife'],
      name: 'NlDesignSystemEditorClippyGutter',
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['@wordpress/plugins', '@wordpress/data', '@wordpress/blocks', '@wordpress/element'],
      output: {
        globals: {
          '@wordpress/plugins': 'wp.plugins',
          '@wordpress/data': 'wp.data',
          '@wordpress/blocks': 'wp.blocks',
          '@wordpress/element': 'wp.element',
        },
        // Keep the extracted stylesheet predictably named so plugin.php and
        // create-zip.mjs can reference it by a fixed path.
        assetFileNames: 'index.[ext]',
      },
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
});



