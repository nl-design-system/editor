# typo3-ckeditor-plugin

Builds the Clippy CKEditor 5 plugin as an ES module for use in TYPO3.

## How it works

`extension/` holds the TYPO3 extension itself: the Composer manifest, the RTE preset, the import map and the page TSconfig. The build copies that folder, the bundle and the generated stylesheets to `app/typo3/packages/clippy/dist/` — not a local `dist/` folder. This makes the plugin immediately available to the TYPO3 demo environment without a manual copy step.

`Configuration/page.tsconfig` sets `RTE.default.preset = clippy`, so every rich text field in the demo uses the preset.

| CKEditor plugin  | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `ClippyPlugin`   | Accessibility feedback in the editor.                       |
| `ContentClasses` | The design-system classes CKEditor writes into the content. |

## The ckeditor5 shim

TYPO3 loads CKEditor 5 as native ES modules through an import map with a specifier per package — `@ckeditor/ckeditor5-core`, `@ckeditor/ckeditor5-ui`, and about fifty others. There is no `ckeditor5` umbrella specifier, so the build externalises `ckeditor5` and rewrites it to `@nl-design-system-community/clippy/ckeditor5.js`, a shim that re-exports the two packages the plugin needs at runtime.

This is why `packages/ckeditor-plugin` needs no host-specific code.

## Prerequisites

Build `ckeditor-plugin` first, since this package depends on its compiled output:

```sh
pnpm --filter @nl-design-system-community/ckeditor-plugin build
```

## Build

```sh
pnpm build
```

Files under `Resources/Public/` are picked up on page reload. After changing `composer.json`, `ext_localconf.php` or anything under `Configuration/`, flush the TYPO3 cache:

```sh
docker compose exec typo3 php vendor/bin/typo3 cache:flush
```
