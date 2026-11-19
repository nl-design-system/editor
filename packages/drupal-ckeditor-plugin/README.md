# drupal-ckeditor-plugin

Builds Clippy Editor for Drupal, the Clippy extension that adds the Clippy CKEditor 5 plugin and Page review to a Drupal site. The plugin is bundled as an IIFE.

For installing and using the module, see its [README](module/README.md). That README is the one published with the module.

## How it works

`module/` holds the Drupal module itself: the `*.yml` plugin registration, the PHP settings form, the config schema and the module's README. The build writes that folder, the bundle and the generated stylesheets to `dist/clippy/`, adds the package version to `clippy.info.yml`, and then copies the result to `app/drupal/modules/clippy/dist/`. The demo mounts `app/drupal/modules/` as `modules/custom/`, so the module is available there without a manual copy step.

## Prerequisites

Build `ckeditor-plugin` first, since this package depends on its compiled output:

```sh
pnpm --filter @nl-design-system-community/ckeditor-plugin run build
```

## Build

```sh
pnpm run build
```

After changing the PHP or the config schema, clear the Drupal cache:

```sh
docker compose exec drupal /opt/drupal/vendor/bin/drush --root=/opt/drupal/web cr
```

## Packaging

```sh
pnpm run build
pnpm run pack
```

`pnpm run pack` packs the build output in `dist/clippy/` into the Extension archive `dist/clippy-drupal-<version>.tgz`. The build writes a minimal `package.json` into that folder, and `publishConfig.directory` points at it, so npm gets the same contents. The module files sit directly under the archive's `package/` folder, next to `package.json`, `README.md` and `LICENSE.md`.

`pnpm run test-build` runs `pnpm run pack` on the existing build and checks the archive: its name, the `package/` folder, the version in `clippy.info.yml`, the module, licence and README files, and that it contains no dotfiles and no source or test output. CI runs it on every pull request.
