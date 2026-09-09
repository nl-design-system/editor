// TYPO3 loads CKEditor 5 as per-package ES modules through an import map and has no `ckeditor5`
// umbrella specifier. This shim re-exports the two packages the plugin needs at runtime — `Plugin`
// from core, `View` from ui — and is the ESM counterpart of the DLL merge in
// packages/drupal-ckeditor-plugin/vite.config.ts.
export * from '@ckeditor/ckeditor5-core';
export * from '@ckeditor/ckeditor5-ui';
