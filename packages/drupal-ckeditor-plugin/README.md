# drupal-ckeditor-plugin

Builds the Clippy CKEditor 5 plugin as an IIFE bundle for use in Drupal.

## How it works

`module/` holds the Drupal module itself: the `*.yml` plugin registration, the PHP settings form and the config schema. The build writes that folder, the bundle and the generated stylesheets to `dist/clippy/`, adds the package version to `clippy.info.yml`, and then copies the result to `app/drupal/modules/clippy/dist/`. The demo mounts `app/drupal/modules/` as `modules/custom/`, so the module is available there without a manual copy step.

Two CKEditor 5 plugins are registered:

| Plugin id                | Configurable | Purpose                                                                                         |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| `clippy_validation`      | no           | Accessibility feedback in the editor.                                                           |
| `clippy_alt_text_wizard` | no           | An Alt-text wizard button in the image alt-text balloon. Only in formats with the image plugin. |

## Page review

Page review shows the accessibility issues of a rendered page on that page. It lists the issues and the Content views (heading structure, link
list and language changes) in a drawer over the page.

### Who sees it

Only users with the **Use Page review** permission, and only on pages rendered in the default
(frontend) theme: nodes, the node Preview of unsaved changes, taxonomy pages, Views listings and
Canvas pages. On install, the permission is granted to the
`content_editor` role if it exists.

### Where the button goes

The button goes in the admin bar the site already uses:

1. the classic **Toolbar**, as a tab, if the Toolbar module renders on the page;
2. otherwise the **Navigation** module's top bar, before the page actions;
3. otherwise it floats in the bottom corner of the page.

Navigation does not render its top bar on every page. It shows on node and user pages, but not on
Views listings such as the front page, so the button floats there.

## Settings

Go to _Configuration → Content authoring → Clippy_ (`/admin/config/content/clippy`). It needs the
_Administer site configuration_ permission.

| Setting                                 | Default             | Effect                                                                                                                                                                     |
| --------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Show accessibility feedback in CKEditor | on                  | Turns Clippy in CKEditor on or off.                                                                                                                                        |
| Show Page review on frontend pages      | on                  | Turns Page review on or off for everyone, whatever their permissions.                                                                                                      |
| Review root selector                    | `main, [role=main]` | The CSS selector of the element Page review validates. When nothing matches, Page review falls back to `main, [role=main]` and then to `body`, so it never fails silently. |
| Always show gutter markers              | on                  | Shows the gutter markers next to the offending elements as soon as the page loads. When off, they only show while the Page review drawer is open.                          |
| Floating button position                | bottom right        | The corner of the Page review button on pages without an admin toolbar: top right or bottom right.                                                                         |

## Color scheme

The editor follows the admin theme, not the browser: a light backend keeps a light editor even for
an editor whose OS is set to dark.

It reads the CSS `color-scheme` the active theme declares on `<html>`, so it works without knowing
which theme is installed:

| Admin theme                          | Declares                                       | Editor |
| ------------------------------------ | ---------------------------------------------- | ------ |
| Gin, dark mode                       | `color-scheme: dark` on `.gin--dark-mode`      | dark   |
| Gin, light mode                      | nothing                                        | light  |
| `default_admin` (core, experimental) | `light` on `html`, `dark` on `.gin--dark-mode` | either |
| Claro                                | nothing                                        | light  |
| A theme declaring `light dark`       | both                                           | the OS |

Any other admin theme with a dark mode is covered as long as it declares its scheme, which it has
to do anyway for native form controls and scrollbars to render correctly.

### Overriding it

A theme that declares no scheme, or the wrong one, can be corrected without patching the plugin.
Set `drupalSettings.clippy.colorScheme` to `dark`, `light` or `auto` (follow the OS) from a module
or theme:

```php
function MYTHEME_page_attachments_alter(array &$attachments): void {
  $attachments['#attached']['drupalSettings']['clippy']['colorScheme'] = 'dark';
}
```

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

`pnpm run pack` packs the build output in `dist/clippy/` into the Extension archive `dist/clippy-drupal-<version>.tgz`. The build writes a minimal `package.json` and this README into that folder, and `publishConfig.directory` points at it, so npm gets the same contents. The module files sit directly under the archive's `package/` folder, next to `package.json`, `README.md` and `LICENSE.md`.

`pnpm run test-build` runs `pnpm run pack` on the existing build and checks the archive: its name, the `package/` folder, the version in `clippy.info.yml`, the module, licence and README files, and that it contains no dotfiles and no source or test output. CI runs it on every pull request.

## Installing

Download `clippy-drupal-<version>.tgz` from [Clippy for Drupal Releases](https://github.com/nl-design-system/editor/releases?q=clippy-drupal).

Unpack it into a new `clippy/` module folder inside `web/modules/custom/`, and enable it:

```sh
mkdir web/modules/custom/clippy
tar -xzf clippy-drupal-<version>.tgz --strip-components=1 -C web/modules/custom/clippy
drush pm:enable clippy
```

The Extend page and `drush pm:list` show the installed version.
