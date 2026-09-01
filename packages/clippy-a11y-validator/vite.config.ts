import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/validate.ts',
      fileName: 'validate',
      formats: ['es'],
    },
    minify: false,
  },
  plugins: [dts({ include: ['src'] })],
});
