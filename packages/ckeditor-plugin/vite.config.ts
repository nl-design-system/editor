import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { HEADING_LEVEL_TOKEN, CONTENT_CLASS_FIELDS } from './src/plugin/content-classes-config.ts';

// Hosts that cannot import JavaScript (the Drupal and TYPO3 modules are PHP) read the editable fields from
// JSON, so src/plugin/content-classes-config.ts stays the single source of truth for the defaults.
function emitContentClassesJson(): Plugin {
  return {
    name: 'emit-content-classes-json',
    closeBundle() {
      const contentClasses = { fields: CONTENT_CLASS_FIELDS, headingLevelToken: HEADING_LEVEL_TOKEN };
      writeFileSync(
        resolve(import.meta.dirname, 'dist/content-classes.json'),
        `${JSON.stringify(contentClasses, null, 2)}\n`,
      );
    },
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
    rollupOptions: {
      // as it is a plugin, ckeditor5 is not added to the build
      external: ['ckeditor5'],
    },
  },
  plugins: [dts({ tsconfigPath: './tsconfig.json' }), emitContentClassesJson()],
});
