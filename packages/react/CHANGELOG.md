# @nl-design-system-community/editor-react

## 1.3.1

### Patch Changes

- fd91384: Fixes:
  - slot attribute from "content" to "value"
  - duplicate editor id fix
  - Component hierarchy
  - Update of examples
- Updated dependencies [fd91384]
  - @nl-design-system-community/editor@1.4.1

## 1.3.0

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

### Patch Changes

- Updated dependencies [7659df9]
  - @nl-design-system-community/editor@1.4.0

## 1.2.0

### Minor Changes

- 04c84a9: Release with type definitions

## 1.1.1

### Patch Changes

- 9dd7ac4: Add `expertteam-digitale-toegankelijkheid` keyword to npm packages.
- Updated dependencies [9dd7ac4]
  - @nl-design-system-community/editor@1.3.1

## 1.1.0

### Minor Changes

- 40f3ceb: Render slot content in react and editor package

### Patch Changes

- Updated dependencies [40f3ceb]
  - @nl-design-system-community/editor@1.3.0

## 1.0.6

### Patch Changes

- Updated dependencies [018197f]
  - @nl-design-system-community/editor@1.2.0

## 1.0.5

### Patch Changes

- Updated dependencies [19c101e]
  - @nl-design-system-community/editor@1.1.0

## 1.0.4

### Patch Changes

- 9bd5f26: Fix: Add globals to rollup options for ssr react conflict

## 1.0.3

### Patch Changes

- 53a7634: Internal changes only.

## 1.0.2

### Patch Changes

- 460ed19: Fix missing main field in package.json, move react to peerDependencies and version 18

## 1.0.1

### Patch Changes

- f83fdbd: Internal changes only.
- Updated dependencies [f83fdbd]
  - @nl-design-system-community/editor@1.0.1

## 1.0.0

### Major Changes

- 8cd7f29: Initial npm release of package

### Patch Changes

- Updated dependencies [8cd7f29]
  - @nl-design-system-community/editor@1.0.0
