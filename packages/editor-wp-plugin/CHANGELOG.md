# Changelog

All notable changes to `@nl-design-system-community/editor-wp-plugin` will be documented in this file.

## [0.1.0] - 2026-04-07

### Added

- Initial release.
- WordPress plugin PHP entry (`plugin.php`) that enqueues the bundle on `enqueue_block_editor_assets`.
- Gutenberg plugin registration (`src/index.ts`) that injects `clippy-validations-gutter` alongside `.editor-styles-wrapper`.
- Validation bridge (`src/validation-bridge.ts`) that serialises Gutenberg blocks to HTML, runs them through a headless TipTap editor, executes clippy validators, and maps results to the live Gutenberg DOM for bounding-box resolution.
- Lit `ContextProvider` on `document.body` distributing `ValidationsMap` to the gutter web component.

