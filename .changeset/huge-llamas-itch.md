---
'@nl-design-system-community/editor': minor
'@nl-design-system-community/editor-react': minor
---

## Release notes

### "Correct" button — apply fixes automatically

Every validation item in the drawer now has a **Correct** button that applies the suggested fix automatically. Supported corrections include fixing heading order, converting pseudo-lists to semantic lists, removing empty marks, removing underlines, adding missing table headings, and more.

### Configurable toolbar

The toolbar is now configurable. Pass a `toolbar` attribute or property to `<clippy-context>` to choose which buttons are shown and in what order.

### Filterable validation drawer

Each validation item in the accessibility drawer can now be opened individually to show its full tip and "Correct" button. The drawer also has severity filter tabs (All / Errors / Warnings / Tips) so authors can focus on the most important issues first.

### Heading structure panel

A new `<clippy-heading-structure>` component renders a navigable table of contents in a side drawer. Clicking a heading scrolls the editor to that heading and highlights any related validation issue in the gutter.

### Content preview

A new `<clippy-content-view>` component displays a read-only preview of the document alongside the editor, with a top bar showing the document title and a toggle for the heading structure panel.


### React: new components and events

The React wrapper now exposes `<ClippyContentView>`, `<ClippyHeadingStructure>`, and `<ClippyValidationsList>` components.

