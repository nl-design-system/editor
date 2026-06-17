/**
 * Custom Elements Manifest configuration.
 *
 * Only the components that are part of the public API (exported from src/index.ts)
 * are included in the manifest. Internal sub-components are intentionally excluded.
 */
export default {
  /** Exclude test files (safety net). */
  exclude: ['**/*.test.ts', '**/*.spec.ts'],

  globs: ['src/components/alt-text-wizard/index.ts'],

  /** Output path for the generated custom-elements.json manifest. */
  outdir: 'dist',

  /** Include information from package.json in the manifest. */
  packagejson: true,
};
