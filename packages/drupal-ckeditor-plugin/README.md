# drupal-ckeditor-plugin

Builds the Clippy CKEditor 5 plugin as an IIFE bundle for use in Drupal.

## How it works

`module/` holds the Drupal module itself: the `*.yml` plugin registration, the PHP settings form and the config schema. The build copies that folder, the bundle and the generated stylesheets to `app/drupal/modules/clippy/` — not a local `dist/` folder. This makes the plugin immediately available to the Drupal module without a manual copy step.

Two CKEditor 5 plugins are registered:

| Plugin id                | Configurable | Purpose                                                     |
| ------------------------ | ------------ | ----------------------------------------------------------- |
| `clippy_validation`      | no           | Accessibility feedback in the editor.                       |
| `clippy_content_classes` | yes          | The design-system classes CKEditor writes into the content. |

## Accessibility report

Every CKEditor on the page registers with one Clippy document, and the bundle registers the core validations with it. On a node form the bundle also places the accessibility report for the whole page beside the form. Below 60rem it moves under the form.

A text field can stand in for a heading on the page, such as the title that the page template renders as the `<h1>`, or a section title that a paragraph's template renders as an `<h2>`. Only the site knows that level, so it is set on the field as a third-party setting:

```yaml
third_party_settings:
  clippy:
    heading_level: 2
```

A field added to a bundle keeps it in its `field.field.*` config. A base field such as the node title has no field config, so the setting goes on its per-bundle override, `core.base_field_override.node.<bundle>.title`. That also lets each content type decide whether its title is the page's `<h1>`.

The module sets `heading_level: 1` on the title of every content type that exists when it is installed and of every content type created afterwards, except during a config import. Remove the setting from a content type's title override to stop its title from counting as the `<h1>`.

The module marks that field's input with `data-clippy-heading-level`, and the bundle registers every marked input as a heading at that level, so heading structure is checked across those fields and every editor in page order, and an empty heading field is reported. The setting has no UI yet; the `clippy_demo` module in `app/drupal` sets it on its section title when it is installed.

A field added by AJAX, such as a new paragraph, joins the report when its editor is created or its heading input attached, and leaves it when its editor is destroyed or its markup is removed.

Where no field is set as the `<h1>`, nothing supplies the title, so the heading rules judge the content as if the first heading started the page.

### Adding your own content to the report

Content that is more than one heading, such as a paragraph type whose template renders a link, can join the report from another module. The bundle publishes `Drupal.clippy` with:

| Property                | Purpose                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `clippyDocument`        | The one document every editor and heading field on the page registers with.                                      |
| `registerHeadingSource` | Registers an input as a heading at a given level, as the `heading_level` setting does.                           |
| `registerProxySource`   | Registers any markup you build from form values. The validations read that markup as part of the page, in order. |

`registerProxySource(clippyDocument, { anchor, events, focus, label, render })` takes:

- `anchor`: the element whose place in the form decides where the markup sits in the page, such as the paragraph's subform;
- `render(container)`: puts the markup the page will show into `container`. Reuse the same elements on every call, so a violation keeps pointing at the same element;
- `events`: events on the anchor after which `render` runs again, such as `input` and `change`;
- `label`: the name the report shows next to each violation;
- `focus`: optional, called when an editor chooses a violation in the report.

It returns `unregister`, which the behavior's `detach` should call when a paragraph is removed. Leave rich text out of the markup: every CKEditor registers itself. Declare `clippy/plugin` as a library dependency so `Drupal.clippy` exists before your script runs.

The _Call to action_ paragraph in `app/drupal/modules/clippy_demo` is a working example: `clippy_demo.module` marks its subform and attaches `js/call-to-action.js`, which renders the link field as an `<a>` so the link rules check its text.

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
