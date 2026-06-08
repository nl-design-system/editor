/**
 * Custom Elements Manifest configuration.
 *
 * Only the components that are part of the public API (exported from src/index.ts)
 * are included in the manifest. Internal sub-components (toolbar-link, toolbar-image,
 * shortcuts-dialog, bubble-menu, etc.) are intentionally excluded.
 */
export default {
  /** Exclude test files (safety net). */
  exclude: ['**/*.test.ts', '**/*.spec.ts'],

  globs: [
    'src/components/context/index.ts',
    'src/components/editor/index.ts',
    'src/components/content/index.ts',
    'src/components/validations/gutter/index.ts',
    'src/components/validations/list/index.ts',
    'src/components/toolbar/index.ts',
  ],

  /** Output path for the generated custom-elements.json manifest. */
  outdir: '.',

  /** Include information from package.json in the manifest. */
  packagejson: true,
};
