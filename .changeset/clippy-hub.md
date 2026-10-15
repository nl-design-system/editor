---
'@nl-design-system-community/ckeditor-plugin': patch
'@nl-design-system-community/editor': minor
---

Add `ClippyHub`, exported from the new `@nl-design-system-community/editor/hub` entry. It validates an element's live DOM, waits for media inside it to settle, debounces repeated runs and feeds the result to a trigger, drawer and optional gutter that share one identifier. The CKEditor plugin now uses it, so several editors on one page no longer cancel each other's debounced validation.
