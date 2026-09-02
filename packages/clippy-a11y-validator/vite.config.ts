import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
    minify: false,
  },
  plugins: [dts({ exclude: ['src/**/*.test.ts', 'src/test-helpers/**'], include: ['src'] })],
});
