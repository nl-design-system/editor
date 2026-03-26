# @nl-design-system-community/editor

## 1.4.1

### Patch Changes

- fd91384: Fixes:
  - slot attribute from "content" to "value"
  - duplicate editor id fix
  - Component hierarchy
  - Update of examples

## 1.4.0

### Minor Changes

- 7659df9: ## Release notes

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

## 1.3.1

### Patch Changes

- 9dd7ac4: Add `expertteam-digitale-toegankelijkheid` keyword to npm packages.

## 1.3.0

### Minor Changes

- 40f3ceb: Render slot content in react and editor package

## 1.2.0

### Minor Changes

- 018197f: Heading, list and paragraph validations, severity levels and drawer iteration

## 1.1.0

### Minor Changes

- 19c101e: Editor validation flow, shortcuts dialog, restructure

## 1.0.1

### Patch Changes

- f83fdbd: Internal changes only.

## 1.0.0

### Major Changes

- 8cd7f29: Initial npm release of package
