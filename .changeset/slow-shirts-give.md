---
"@nl-design-system-community/editor": major
---

Split `clippy-validations-drawer` into `clippy-validations-view` and `clippy-content-views`, shown one at a time in the new `clippy-sidebar`. The Clippy hub docks that sidebar with both views as `hub.sidebar` instead of `hub.drawer`, and `createDrawer` is now `createSidebar`. "Drawer" is renamed to "sidebar" everywhere: `CLOSE_SIDEBAR`, `SIDEBAR_TOGGLE` and `FOCUS_VALIDATION_ITEM_IN_SIDEBAR` (with their `*Detail`/`*Event` types), the gutter mode and Page review option `sidebar`, and `--clippy-sidebar-offset-block-start` and `--clippy-sidebar-inline-size`. The Content views get tabs, clicking an item focuses it in the editor, and headings and links get a toggle that opens their validations. The gutter no longer shows a validation card inline, and `FOCUS_VALIDATION_ITEM_IN_GUTTER` is removed.
