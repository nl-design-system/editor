# `@nl-design-system-community/editor-wp-plugin`

WordPress plugin that renders the **clippy-validations-gutter** accessibility validation sidebar inside the WordPress block editor (Gutenberg).

## What it does

When installed and activated, the plugin:

1. **Registers a Gutenberg plugin** via `@wordpress/plugins` so WordPress loads the bundle on every block-editor page.
2. **Injects `<clippy-validations-gutter>`** as a positioned overlay alongside the Gutenberg editor canvas (`.editor-styles-wrapper`).
3. **Runs clippy accessibility validators** on every block-content change by:
   - Serialising the current block tree to HTML via `@wordpress/blocks`.
   - Parsing that HTML with a headless TipTap editor instance.
   - Executing the same validator rules used by the standalone `clippy-context` component.
4. **Resolves bounding boxes** for each validation result by querying `[data-block="<clientId>"]` elements in the live Gutenberg DOM, so gutter indicators appear at the correct vertical position.
5. **Distributes results** via a `@lit/context` `ContextProvider` mounted on `document.body`, so the web component re-renders reactively.

## Installation

### In a WordPress site

Copy (or symlink) the entire package directory to your WordPress plugins folder and activate it from the WordPress admin:

```bash
cp -r packages/editor-wp-plugin /path/to/wordpress/wp-content/plugins/nl-design-system-editor
```

Then activate **NL Design System Community Editor – Clippy Gutter** from *Plugins → Installed Plugins*.

The PHP file (`plugin.php`) enqueues `dist/index.js` and `dist/index.css` (if present) on the `enqueue_block_editor_assets` hook.

### Build

```bash
pnpm --filter @nl-design-system-community/editor-wp-plugin run build
```

This runs `tsc --build` followed by `vite build` and outputs to `dist/`.

## Configuration

Editor settings (heading level, rule overrides) are currently hard-coded to safe defaults in `src/index.ts → resolveEditorSettings()`. A future version can read them from a `wp_localize_script` data object set by the PHP plugin.

## Architecture

```
src/
  index.ts              # Plugin entry: registers Gutenberg plugin, bootstraps gutter injection
  validation-bridge.ts  # Bridges Gutenberg store → headless TipTap → clippy validators → ContextProvider
  wordpress.d.ts        # Ambient types for @wordpress/* runtime globals
plugin.php              # WordPress plugin header + enqueue_block_editor_assets hook
```

### `validation-bridge.ts` – position mapping

Because the headless TipTap editor has no live DOM, `getNodeBoundingBox` (ProseMirror's `nodeDOM` API) cannot be used. Instead the bridge:

1. Walks the serialised block list in order to build a `{ clientId, start, end }` character-offset map.
2. For each validation result, finds the matching block by `pos` range and queries `[data-block="<clientId>"]` in the Gutenberg editor DOM.
3. Computes `top` and `height` relative to `.editor-styles-wrapper` so the gutter overlay positions correctly.

## Accessibility

- `clippy-validations-gutter` is a fully accessible Web Component with keyboard navigation and ARIA live regions — no extra ARIA work is required in this plugin.
- All validation messages follow WCAG 2.2 Level AA guidelines.
- The gutter uses `position: absolute` inside the editor canvas, which does not affect document flow or focus order.

## Keyboard interaction

Keyboard interaction is handled entirely by `clippy-validations-gutter`. See the main [`@nl-design-system-community/editor`](../editor/README.md) documentation for details.

