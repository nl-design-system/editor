# @nl-design-system-community/ckeditor-plugin

## 0.5.1

### Patch Changes

- Updated dependencies [fd06803]
- Updated dependencies [f490c4a]
- Updated dependencies [17168df]
  - @nl-design-system-community/editor@4.0.0

## 0.5.0

### Minor Changes

- d589b47: Added inline drawer support.

### Patch Changes

- f02b500: Temporarily disable `HEADING_MUST_START_AT_LEVEL_ONE`: content in a CMS editor is part of a page that provides its own `h1`. Heading levels after the first heading are still validated.
- Updated dependencies [76acf2b]
- Updated dependencies [27b2c79]
- Updated dependencies [d589b47]
  - @nl-design-system-community/editor@3.0.0

## 0.4.4

### Patch Changes

- 8b7248e: Route every correction of a violation through the CKEditor model, not just the first.
- Updated dependencies [fe3b84b]
- Updated dependencies [ec815ff]
- Updated dependencies [163628c]
- Updated dependencies [7fed8f0]
- Updated dependencies [d7a2669]
- Updated dependencies [8b7248e]
- Updated dependencies [edb7e61]
  - @nl-design-system-community/editor@2.0.0

## 0.4.3

### Patch Changes

- Updated dependencies [c572413]
  - @nl-design-system-community/editor@1.11.0

## 0.4.2

### Patch Changes

- Updated dependencies [19bdc0f]
  - @nl-design-system-community/editor@1.10.0

## 0.4.1

### Patch Changes

- Updated dependencies [49f7e83]
  - @nl-design-system-community/editor@1.9.1

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
