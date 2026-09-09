import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // The validator build runs first and owns dist, so this build only adds to it.
    emptyOutDir: false,
    lib: {
      entry: 'cli/index.ts',
      fileName: 'cli',
      formats: ['es'],
    },
    minify: false,
    rollupOptions: {
      // The CLI drives a browser and reads files, so its dependencies stay out of the bundle.
      external: ['playwright', ...builtinModules, ...builtinModules.map((name) => `node:${name}`)],
      output: {
        banner: '#!/usr/bin/env node',
      },
      // The CLI exports nothing and is all side effects, so its entry must survive tree-shaking.
      preserveEntrySignatures: 'strict',
    },
  },
});
