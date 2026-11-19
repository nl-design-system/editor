# Clippy Editor for TYPO3

Clippy Editor gives content editors accessibility feedback based on NL Design System guidelines, both while writing in CKEditor 5 and on the rendered pages of the site. The extension installs on TYPO3 12.4, 13.4 and 14.

## Installing

Download `clippy-typo3-<version>.tgz` from [Clippy Editor for TYPO3 Releases](https://github.com/nl-design-system/editor/releases?q=clippy-typo3).

### Installing with Composer

Unpack the archive into a new `packages/clippy/` folder of the TYPO3 project, so `composer.json` sits directly in that folder:

```sh
mkdir -p packages/clippy
tar -xzf clippy-typo3-<version>.tgz --strip-components=1 -C packages/clippy
```

The root `composer.json` needs a path repository for `packages/*`, which the TYPO3 base distribution already has:

```json
"repositories": [{ "type": "path", "url": "packages/*" }]
```

Then require and set up the extension:

```sh
composer require nl-design-system-community/clippy:@dev
vendor/bin/typo3 extension:setup
```

### Installing without Composer

Unpack the archive into a new `typo3conf/ext/clippy/` folder, then activate **Clippy Editor** under _Admin Tools → Extensions_:

```sh
mkdir typo3conf/ext/clippy
tar -xzf clippy-typo3-<version>.tgz --strip-components=1 -C typo3conf/ext/clippy
```

### Uploading in the Extension Manager

_Admin Tools → Extensions → Upload Extension_ only accepts zips. To use it, repackage the contents of the archive's `package/` folder as `clippy_<version>.zip`, with the extension files at the root of the zip:

```sh
mkdir clippy
tar -xzf clippy-typo3-<version>.tgz --strip-components=1 -C clippy
(cd clippy && zip -r ../clippy_<version>.zip .)
```

TYPO3 derives the extension key from the file name, so keep the `clippy_` prefix.

TYPO3 activates a newly uploaded extension in the request that unpacked it, which it cannot do: the upload fails with `Extension clippy is not available` and is deleted again. This is TYPO3's own behaviour, unrelated to this extension, and unchanged from 12.4 through 14. Uploading and activating separately does work, so turn off _automaticInstallation_ under _Admin Tools → Settings → Extension Configuration → extensionmanager_ before uploading.

## How Clippy Editor is switched on

Clippy Editor ships no RTE preset. It listens to `BeforePrepareConfigurationForEditorEvent` and adds itself to every rich text editor, so your own presets keep working.

Clippy Editor is on as soon as the extension is installed. To switch it off for the whole installation, clear _Add Clippy Editor to every rich text editor_ under _Admin Tools → Settings → Extension Configuration → clippy_.

To leave Clippy Editor out of a single preset, remove its module in that preset:

```yaml
editor:
  config:
    removeImportModules:
      - '@nl-design-system-community/clippy/clippy.js'
```

| CKEditor plugin | Purpose                               |
| --------------- | ------------------------------------- |
| `ClippyPlugin`  | Accessibility feedback in the editor. |

## Page review

Backend users who are logged in see a floating Page review button on frontend pages. The `InjectPageReview` frontend middleware adds the Page review script and stylesheet from `Resources/Public/PageReview/` to the `<head>` of HTML responses, but only when a backend user is authenticated in that request. The Admin Panel isn't needed.

The middleware changes the response after TYPO3 has rendered or loaded the page from cache, so the page cache never contains the script and visitors who aren't logged in to the backend never get it.

### Why theme issues show up

Page review checks the Review root, the page's main content region, and not only the HTML written in the rich text editor. The heading structure and the other overviews only make sense across the whole region, which combines several content elements with headings from the theme, such as the page title. As a result, Page review can report issues in theme markup that an editor can't fix.

## Settings

Set these for the whole installation under _Admin Tools → Settings → Extension Configuration → clippy_. Clearing _Add Clippy Editor to every rich text editor_ only switches off the CKEditor integration, and clearing _Show Page review on frontend pages_ only switches off Page review.

| Extension configuration                     | Default             | Description                                                                                                                                                                |
| ------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add Clippy Editor to every rich text editor | on                  | Turns Clippy Editor in CKEditor on or off.                                                                                                                                 |
| Show Page review on frontend pages          | on                  | Turns Page review on or off for every backend user.                                                                                                                        |
| Review root selector                        | `main, [role=main]` | The CSS selector of the element Page review validates. When nothing matches, Page review falls back to `main, [role=main]` and then to `body`, so it never fails silently. |
| Always show gutter markers                  | on                  | Shows the gutter markers as soon as the page loads. When off, they only show while the Page review Drawer is open.                                                         |
| Floating button position                    | bottom right        | The corner of the Page review button: top right or bottom right.                                                                                                           |

## Source and issues

Clippy Editor is developed in [nl-design-system/editor](https://github.com/nl-design-system/editor) on GitHub, where you can also report issues.
