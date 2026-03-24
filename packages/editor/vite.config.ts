import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import dts from 'vite-plugin-dts';
import alias from './vite.alias';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.app.json',
    }),
    ...(process.env['ANALYZE_BUNDLE'] ? [analyzer()] : []),
  ],
  resolve: {
    ...alias,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
