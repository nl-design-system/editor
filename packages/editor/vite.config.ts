import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
  },
  plugins: [
    analyzer({
      enabled: process.env['ANALYZE_BUNDLE'] === 'true',
    }),
    dts(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
});
