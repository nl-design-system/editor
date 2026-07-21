import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import alias from './vite.alias';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'accessibility-notifications': 'src/entries/accessibility-notifications.ts',
        'editor-wrapper': 'src/entries/editor-wrapper.ts',
        gutter: 'src/entries/gutter.ts',
        index: 'src/index.ts',
        toolbar: 'src/entries/toolbar.ts',
        validators: 'src/entries/validators.ts',
      },
      formats: ['es'],
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  resolve: {
    ...alias,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
