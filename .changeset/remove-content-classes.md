---
'@nl-design-system-community/editor': minor
'@nl-design-system-community/ckeditor-plugin': minor
'@nl-design-system-community/drupal-ckeditor-plugin': minor
'@nl-design-system-community/typo3-ckeditor-plugin': minor
---

Remove the content classes from CKEditor. CKEditor writes plain markup again: the `ContentClasses` plugin, the `contentClasses` editor config and `content-classes.json` are gone, as are Drupal's per-format **Content classes** tab and TYPO3's `Clippy` site set. The `@nl-design-system-community/editor/content-classes` entry point is removed; the Tiptap editor keeps its classes for styling.
