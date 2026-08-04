---
'@nl-design-system-community/ckeditor-plugin': patch
'@nl-design-system-community/editor': patch
---

Restore opening the validations drawer by clicking a gutter indicator in the CKEditor plugin. The gutter now accepts a standalone `identifier` property, so hosts without a `<clippy-context>` provider can scope its drawer events to the right editor.
