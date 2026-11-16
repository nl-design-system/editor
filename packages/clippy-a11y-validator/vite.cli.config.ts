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
      // The CLI imports the validator by its package name, so the validator is not bundled into it a second time.
      external: [
        '@clack/prompts',
        '@nl-design-system-community/clippy-a11y-validator',
        'diff',
        'happy-dom',
        ...builtinModules,
        ...builtinModules.map((name) => `node:${name}`),
      ],
      output: {
        banner: '#!/usr/bin/env node',
      },
      // The CLI exports nothing and is all side effects, so its entry must survive tree-shaking.
      preserveEntrySignatures: 'strict',
    },
  },
});
