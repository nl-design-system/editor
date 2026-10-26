import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const moduleOut = resolve(import.meta.dirname, '../../app/drupal/modules/clippy/dist');

const editorRequire = createRequire(resolve(import.meta.dirname, '../editor/package.json'));

const THEME_CSS = [
  editorRequire.resolve('@nl-design-system-community/ma-design-tokens/dist/theme.css'),
  editorRequire.resolve('@nl-design-system-community/ma-design-tokens/dist/color-scheme-dark/theme.css'),
  editorRequire.resolve('@utrecht/design-tokens/dist/theme.css'),
  resolve(import.meta.dirname, '../editor/theme.css'),
];

const PAGE_REVIEW_ELEMENTS = ':where(clippy-validations-drawer, clippy-page-review-trigger)';

function writePageReviewStyles(): Plugin {
  return {
    name: 'write-page-review-styles',
    closeBundle() {
      const css = THEME_CSS.map((path) => readFileSync(path, 'utf8'))
        .join('\n')
        .replaceAll(/\.(?:ma|utrecht|clippy)-theme(?![\w-])/g, PAGE_REVIEW_ELEMENTS);
      writeFileSync(resolve(moduleOut, 'clippy-page-review.css'), css);
    },
  };
}

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      name: 'clippyPageReview',
      entry: 'src/page-review.ts',
      formats: ['iife'],
    },
    outDir: moduleOut,
    rollupOptions: {
      output: {
        entryFileNames: 'clippy-page-review.js',
      },
    },
  },
  plugins: [writePageReviewStyles()],
});
