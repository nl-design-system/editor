---
"@nl-design-system-community/editor": patch
---

Content views and the validations gutter and drawer no longer depend on TipTap. They now get the rendered content element from a new `contentElementContext`. The unused `editor` property is removed from `clippy-validations-drawer`.
