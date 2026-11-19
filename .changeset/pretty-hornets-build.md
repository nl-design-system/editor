---
"@nl-design-system-community/editor": major
---

Replace `clippy-validations-drawer` with a generic `clippy-sidebar` that shows the validations or the content views.

- `clippy-sidebar` is a drawer with a header beside the close button, a body and an optional footer. The Clippy hub docks it as `hub.drawer` and shows `clippy-validations-view` with the validations or `clippy-content-views` with the content views in it, one at a time. `ValidationsDrawer` is replaced by `Drawer`, `ValidationsView` and `ContentViews`.
- Clicking a gutter indicator or a content view item no longer shows a validation card inline: an indicator opens its validations in the drawer, and a content view item is focused in the editor. The `FOCUS_VALIDATION_ITEM_IN_GUTTER` event and its `FocusValidationItemInGutterDetail` and `FocusValidationItemInGutterEvent` types are removed.
- Switch between the content views (heading structure, links and language changes) with tabs in the header of the drawer.
- Every content view starts with a heading, an explanation and a link to the NL Design System guidelines. The validations of a heading or link open from an icon button in the colour of their severity. Headings with a validation are shown in that colour, links are shown like validation titles, and the language changes also show the document language.
