import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { autofixesJson } from './src/autofixes.ts';
import { coreValidations } from './src/components/index.ts';

/** Publishes which documentation solutions the core rules fix, for the documentation to mark them. */
const autofixes = (): Plugin => ({
  name: 'autofixes',
  generateBundle() {
    this.emitFile({
      fileName: 'autofixes.json',
      source: `${JSON.stringify(autofixesJson(Object.values(coreValidations)), null, 2)}\n`,
      type: 'asset',
    });
  },
});

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
    minify: false,
  },
  plugins: [autofixes(), dts({ exclude: ['src/**/*.test.ts', 'src/test-helpers'], include: ['src'] })],
});
