# drupal-ckeditor-plugin

Builds the Clippy CKEditor 5 plugin as an IIFE bundle for use in Drupal.

## How it works

The build output is written directly to `app/drupal/modules/clippy/dist/` — not a local `dist/` folder. This makes the plugin immediately available to the Drupal module without a manual copy step.

## Prerequisites

Build `editor-ckeditor` first, since this package depends on its compiled output:

```sh
pnpm --filter @nl-design-system-community/editor-ckeditor build
```

## Build

```sh
pnpm build
```
