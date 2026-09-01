# drupal-ckeditor-plugin

Builds the Clippy CKEditor 5 plugin as an IIFE bundle for use in Drupal.

## How it works

`module/` holds the Drupal module itself: the `*.yml` plugin registration, the PHP settings form and the config schema. The build copies that folder, the bundle and the generated stylesheets to `app/drupal/modules/clippy/` — not a local `dist/` folder. This makes the plugin immediately available to the Drupal module without a manual copy step.

Two CKEditor 5 plugins are registered:

| Plugin id                | Configurable | Purpose                                                     |
| ------------------------ | ------------ | ----------------------------------------------------------- |
| `clippy_validation`      | no           | Accessibility feedback in the editor.                       |
| `clippy_content_classes` | yes          | The design-system classes CKEditor writes into the content. |

## Editing the content classes

Go to _Configuration → Content authoring → Text formats and editors_, edit a CKEditor 5 format and open the **Content classes** tab. Every class can be changed, and clearing a field outputs that element without a class.

The **Heading** field is a pattern: `{level}` is replaced by the level of the heading that is rendered, so one field covers `<h1>` through `<h6>`.

Changing a class replaces the previous one. That matters in Full HTML, where General HTML Support keeps class attributes in the editor model: without replacing, a class saved earlier would end up next to the new one.

The fields and their defaults are not written here. They come from `dist/content-classes.json`, which the `ckeditor-plugin` build generates from `src/plugin/content-classes-config.ts`. Adding a class there makes it appear in this form without a PHP change, and keeps the module from drifting away from the editor. Other CMS integrations read the same file.

### Allowed HTML

The plugin declares `<p class>`, `<h2 class>` … as its elements, and narrows that to the configured values in `ContentClasses::getElementsSubset()`. Without this, a format using _"Limit allowed HTML tags and correct faulty HTML"_ (such as Basic HTML) strips the classes when it renders the content.

`<h1>` and `<figure>` are left out, see `ContentClasses::NON_CREATABLE_TAGS`. Drupal validates that every tag a plugin claims an attribute on can actually be created by some enabled plugin, and refuses to save the format otherwise. Nothing creates `<figure>` — Drupal rewrites a caption to `data-caption` on `<img>` — and `heading1` is off in every stock format. So in a restricted format the image and table classes only reach `<img>`, not the wrapper; in Full HTML, which is unrestricted, the editor writes all of them.

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

Build `ckeditor-plugin` first, since this package depends on its compiled output and on the `content-classes.json` it generates:

```sh
pnpm --filter @nl-design-system-community/ckeditor-plugin build
```

## Build

```sh
pnpm build
```

After changing the PHP or the config schema, clear the Drupal cache:

```sh
docker compose exec drupal /opt/drupal/vendor/bin/drush --root=/opt/drupal/web cr
```
