# @nl-design-system-community/ckeditor-plugin

## 0.4.0

### Minor Changes

- d8e68aa: Remove the content classes from CKEditor. CKEditor writes plain markup again: the `ContentClasses` plugin, the `contentClasses` editor config and `content-classes.json` are gone, as are Drupal's per-format **Content classes** tab and TYPO3's `Clippy` site set. The `@nl-design-system-community/editor/content-classes` entry point is removed; the Tiptap editor keeps its classes for styling.

### Patch Changes

- 520bb5e: Add `ClippyHub`, exported from the new `@nl-design-system-community/editor/hub` entry. It validates an element's live DOM, waits for media inside it to settle, debounces repeated runs and feeds the result to a trigger, drawer and optional gutter that share one identifier. The CKEditor plugin now uses it, so several editors on one page no longer cancel each other's debounced validation.
- Updated dependencies [520bb5e]
- Updated dependencies [081b960]
- Updated dependencies [d8e68aa]
  - @nl-design-system-community/editor@1.9.0

## 0.3.3

### Patch Changes

- Updated dependencies [024afeb]
  - @nl-design-system-community/editor@1.8.3

## 0.3.2

### Patch Changes

- @nl-design-system-community/editor@1.8.2

## 0.3.1

### Patch Changes

- @nl-design-system-community/editor@1.8.1

## 0.3.0

### Minor Changes

- 6a3702e: Add the Alt-text wizard to CKEditor.

### Patch Changes

- Updated dependencies [6a3702e]
  - @nl-design-system-community/editor@1.8.0

## 0.2.1

### Patch Changes

- Updated dependencies [61fbcba]
  - @nl-design-system-community/editor@1.7.0

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
