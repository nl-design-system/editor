import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import alias from './vite.alias';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'state-machine': 'src/state-machine.ts',
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
    port: 5174,
  },
});
