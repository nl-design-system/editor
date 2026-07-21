---
'@nl-design-system-community/editor': patch
---

Fix: preserve the `start` and `type` attributes on ordered lists.

Extending a Tiptap node with `addAttributes()` replaces the node's own attributes instead of merging with
them. Because the `dir`/`lang` overrides did not spread `this.parent?.()`, `<ol start="5">` and `<ol type="a">`
silently lost those attributes, resetting list numbering when existing content was loaded and saved again.
