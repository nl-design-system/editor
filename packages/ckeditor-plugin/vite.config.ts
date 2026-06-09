import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

function copyStyles(): Plugin {
  return {
    name: 'copy-styles',
    closeBundle() {
      const src = resolve(import.meta.dirname, 'src');
      const dist = resolve(import.meta.dirname, 'dist');
      copyFileSync(resolve(src, 'styles/main.css'), resolve(dist, 'clippy.css'));
      copyFileSync(resolve(src, 'styles/main.css.d.ts'), resolve(dist, 'clippy.css.d.ts'));
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
  plugins: [dts({ tsconfigPath: './tsconfig.json' }), copyStyles()],
});
