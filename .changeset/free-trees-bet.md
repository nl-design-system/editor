---
"@nl-design-system-community/editor": major
---

Replace `clippy-validations-drawer` with `clippy-sidebar`, a generic drawer with a header beside the close button, a body and an optional footer. The Clippy hub docks it as `hub.drawer` and shows `clippy-validations-view` with the validations or `clippy-content-views` with the Content views in it, one at a time. `ValidationsDrawer` is replaced by `Drawer`, `ValidationsView` and `ContentViews`.
