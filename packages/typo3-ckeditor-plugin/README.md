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

## Packaging

```sh
pnpm build-and-zip
```

This builds the extension and zips it into `dist/clippy_<version>.zip`, with the extension files at the root of the archive. The zip installs on TYPO3 12.4, 13.4 and 14.

### Installing with Composer

Unzip the archive into `packages/clippy/` of the TYPO3 project, so `composer.json` sits directly in that folder. The root `composer.json` needs a path repository for `packages/*`, which the TYPO3 base distribution already has:

```json
"repositories": [{ "type": "path", "url": "packages/*" }]
```

Then require and set up the extension:

```sh
composer require nl-design-system-community/clippy:@dev
vendor/bin/typo3 extension:setup
```

### Installing without Composer

Upload the zip under _Admin Tools → Extensions → Upload Extension_, then activate **Clippy** in the extension list. TYPO3 derives the extension key from the file name, so keep the `clippy_` prefix when renaming the file.

TYPO3 activates a newly uploaded extension in the request that unpacked it, which it cannot do: the upload fails with `Extension clippy is not available` and is deleted again. This is TYPO3's own behaviour, unrelated to this extension, and unchanged from 12.4 through 14. Uploading and activating separately does work, so either turn off _automaticInstallation_ under _Admin Tools → Settings → Extension Configuration → extensionmanager_ before uploading, or skip the upload form and unpack the zip into `typo3conf/ext/clippy/` by hand before activating it.

### Content classes

On TYPO3 13.4 and 14, add the **Clippy** site set to edit the classes under the site's settings. TYPO3 12.4 has no site sets, so override them in the Page TSconfig of the root page instead:

```text
RTE.default.editor.config.contentClasses.paragraph = my-paragraph
```

The generated `Configuration/Sets/Clippy/page.tsconfig` lists every key.
