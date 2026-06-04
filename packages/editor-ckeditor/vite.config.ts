import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

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
  plugins: [dts({ tsconfigPath: './tsconfig.json' })],
});
