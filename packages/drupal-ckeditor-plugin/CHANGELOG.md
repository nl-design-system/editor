# @nl-design-system-community/drupal-ckeditor-plugin

## 0.5.1

### Patch Changes

- Updated dependencies [c572413]
  - @nl-design-system-community/editor@1.11.0
  - @nl-design-system-community/ckeditor-plugin@0.4.3

## 0.5.0

### Minor Changes

- 19bdc0f: Add a Floating button position setting that puts the Page review button in the top right or bottom right corner on pages without an admin toolbar.

### Patch Changes

- Updated dependencies [19bdc0f]
  - @nl-design-system-community/editor@1.10.0
  - @nl-design-system-community/ckeditor-plugin@0.4.2

## 0.4.1

### Patch Changes

- 49f7e83: Clippy is always shown in Dutch, whatever the CMS interface language, until English copy is available.
- Updated dependencies [49f7e83]
  - @nl-design-system-community/editor@1.9.1
  - @nl-design-system-community/ckeditor-plugin@0.4.1

## 0.4.0

### Minor Changes

- 652c016: Add Page review to the Clippy Drupal module.
  The module now requires Drupal 11.1 or later.
- d8e68aa: Remove the content classes from CKEditor. CKEditor writes plain markup again: the `ContentClasses` plugin, the `contentClasses` editor config and `content-classes.json` are gone, as are Drupal's per-format **Content classes** tab and TYPO3's `Clippy` site set. The `@nl-design-system-community/editor/content-classes` entry point is removed; the Tiptap editor keeps its classes for styling.

### Patch Changes

- Updated dependencies [520bb5e]
- Updated dependencies [081b960]
- Updated dependencies [d8e68aa]
  - @nl-design-system-community/ckeditor-plugin@0.4.0
  - @nl-design-system-community/editor@1.9.0

## 0.3.3

### Patch Changes

- @nl-design-system-community/ckeditor-plugin@0.3.3

## 0.3.2

### Patch Changes

- @nl-design-system-community/ckeditor-plugin@0.3.2

## 0.3.1

### Patch Changes

- @nl-design-system-community/ckeditor-plugin@0.3.1

## 0.3.0

### Minor Changes

- d3b212b: Add the Alt-text wizard to the alt-text balloon of inline images in Drupal.

### Patch Changes

- Updated dependencies [6a3702e]
  - @nl-design-system-community/ckeditor-plugin@0.3.0

## 0.2.1

### Patch Changes

- @nl-design-system-community/ckeditor-plugin@0.2.1

## 0.2.0

### Minor Changes

- 6e78b92: Make the design-system content classes configurable. CKEditor reads them from the `contentClasses` editor config, and Drupal exposes them per text format, where a class can be changed or cleared.

### Patch Changes

- Updated dependencies [6e78b92]
- Updated dependencies [8a9b19f]
  - @nl-design-system-community/ckeditor-plugin@0.2.0

## 0.1.0

### Minor Changes

- 83406ca: Apply the design-system content classes to CKEditor content.

### Patch Changes

- Updated dependencies [83406ca]
  - @nl-design-system-community/ckeditor-plugin@0.1.0

## 0.0.2

### Patch Changes

- @nl-design-system-community/ckeditor-plugin@0.0.2
