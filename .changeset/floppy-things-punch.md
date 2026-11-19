---
"@nl-design-system-community/clippy-a11y-validator": patch
"@nl-design-system-community/ckeditor-plugin": patch
---

Temporarily disable `HEADING_MUST_START_AT_LEVEL_ONE`: content in a CMS editor is part of a page that provides its own `h1`. Heading levels after the first heading are still validated.
