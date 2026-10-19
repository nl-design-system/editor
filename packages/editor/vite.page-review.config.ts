import { defineConfig } from 'vite';
import alias from './vite.alias';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: { 'page-review': 'src/entries/page-review.ts' },
      formats: ['es'],
    },
  },
  resolve: {
    ...alias,
  },
});
