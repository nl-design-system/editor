---
'@nl-design-system-community/editor': minor
---

Add a granular `@nl-design-system-community/editor/validation-item` entry point that registers the `<clippy-validation-item>` custom element and exports `ValidationItem`, `validationInteractionMode`, and the related types. This lets consumers reuse the accessibility validation card outside the editor (e.g. in the browser extension) without pulling in the full editor bundle.
