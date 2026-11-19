# typo3-ckeditor-plugin

Builds Clippy Editor for TYPO3, the Clippy extension that adds the Clippy CKEditor 5 plugin and Page review to a TYPO3 site. The plugin is bundled as an ES module.

For installing and using the extension, see its [README](extension/README.md). That README is the one published with the extension.

## How it works

`extension/` holds the TYPO3 extension itself: the Composer manifest, the event listener, the import map, the extension configuration and the extension's README. The build writes that folder, the bundle and the generated stylesheets to `dist/clippy/`, and then copies the result to `app/typo3/packages/clippy/dist/`. This makes the plugin immediately available to the TYPO3 demo environment without a manual copy step.

## The ckeditor5 shim

TYPO3 loads CKEditor 5 as native ES modules through an import map with a specifier per package — `@ckeditor/ckeditor5-core`, `@ckeditor/ckeditor5-ui`, and about fifty others. There is no `ckeditor5` umbrella specifier, so the build externalises `ckeditor5` and rewrites it to `@nl-design-system-community/clippy/ckeditor5.js`, a shim that re-exports the two packages the plugin needs at runtime.

This is why `packages/ckeditor-plugin` needs no host-specific code.

## Prerequisites

Build `ckeditor-plugin` first, since this package depends on its compiled output:

```sh
pnpm --filter @nl-design-system-community/ckeditor-plugin run build
```

## Build

```sh
pnpm run build
```

Files under `Resources/Public/` are picked up on page reload. After changing `ext_localconf.php`, `Classes/` or anything under `Configuration/`, flush the TYPO3 cache:

```sh
docker compose exec typo3 php vendor/bin/typo3 cache:flush
```

After changing `composer.json`, rebuild the image, since Composer only reads the extension's `autoload` section when it installs the extension:

```sh
docker compose up --build
```

## Packaging

```sh
pnpm run build
pnpm run pack
```

`pnpm run pack` packs the build output in `dist/clippy/` into the Extension archive `dist/clippy-typo3-<version>.tgz`. The build writes a minimal `package.json` into that folder, and `publishConfig.directory` points at it, so npm gets the same contents. The extension files sit directly under the archive's `package/` folder, next to `package.json`, `README.md` and `LICENSE.md`.

`pnpm run test-build` runs `pnpm run pack` on the existing build and checks the archive: its name, the `package/` folder, the version in `composer.json` and `ext_emconf.php`, the extension, licence and README files, and that it contains no dotfiles and no source or test output. CI runs it on every pull request.
