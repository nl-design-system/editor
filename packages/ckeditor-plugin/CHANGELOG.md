# @nl-design-system-community/ckeditor-plugin

## 0.2.0

### Minor Changes

- 6e78b92: Make the design-system content classes configurable. CKEditor reads them from the `contentClasses` editor config, and Drupal exposes them per text format, where a class can be changed or cleared.

### Patch Changes

- 8a9b19f: Restore opening the validations drawer by clicking a gutter indicator in the CKEditor plugin. The gutter now accepts a standalone `identifier` property, so hosts without a `<clippy-context>` provider can scope its drawer events to the right editor.
- Updated dependencies [6e78b92]
- Updated dependencies [8a9b19f]
  - @nl-design-system-community/editor@1.6.0

## 0.1.0

### Minor Changes

- 83406ca: Apply the design-system content classes to CKEditor content.

### Patch Changes

- Updated dependencies [47f4dc2]
- Updated dependencies [e0d51ea]
  - @nl-design-system-community/editor@1.5.0

## 0.0.2

### Patch Changes

- @nl-design-system-community/editor@1.4.3
