# @nl-design-system-community/editor

## 4.0.1

### Patch Changes

- bb64444: `@nl-design-system-community/clippy-components` bijgewerkt naar 3.10.1.
- 1c108d7: Paginacontrole laat elementen met een `data-clippy-ignore`-attribuut weg uit de validatie en de Content views. Met de nieuwe optie `reviewIgnores` voeg je daar een CSS-selector aan toe, bijvoorbeeld voor CMS-bewerkingslinks.
- Updated dependencies [bb64444]
  - @nl-design-system-community/clippy-alt-text-wizard@0.2.4

## 4.0.0

### Major Changes

- fd06803: `clippy-validation-item`: de property `solution` is vervangen door `solutions`, een lijst met HTML. Eén oplossing wordt getoond zoals hij is, meerdere oplossingen als opsomming.
- f490c4a: Replace `clippy-validations-drawer` with a generic `clippy-sidebar` that shows the validations or the content views.
  
  - `clippy-sidebar` is a drawer with a header beside the close button, a body and an optional footer. The Clippy hub docks it as `hub.drawer` and shows `clippy-validations-view` with the validations or `clippy-content-views` with the content views in it, one at a time. `ValidationsDrawer` is replaced by `Drawer`, `ValidationsView` and `ContentViews`.
  - Clicking a gutter indicator or a content view item no longer shows a validation card inline: an indicator opens its validations in the drawer, and a content view item is focused in the editor. The `FOCUS_VALIDATION_ITEM_IN_GUTTER` event and its `FocusValidationItemInGutterDetail` and `FocusValidationItemInGutterEvent` types are removed.
  - Switch between the content views (heading structure, links and language changes) with tabs in the header of the drawer.
  - Every content view starts with a heading, an explanation and a link to the NL Design System guidelines. The validations of a heading or link open from an icon button in the colour of their severity. Headings with a validation are shown in that colour, links are shown like validation titles, and the language changes also show the document language.

### Minor Changes

- 17168df: De correctie voor een afbeelding zonder alternatieve tekst heet nu "Alternatieve tekst toevoegen" in plaats van "Bewerken".

### Patch Changes

- Updated dependencies [17168df]
- Updated dependencies [fd06803]
  - @nl-design-system-community/clippy-a11y-validator@1.0.0

## 3.0.0

### Major Changes

- d589b47: Added inline drawer support.

### Patch Changes

- 76acf2b: Export `package.json`, so tools can read the package metadata by package name.
- 27b2c79: Re-validate the content of a Clippy hub after a correction is applied.
- Updated dependencies [76acf2b]
- Updated dependencies [786ba80]
- Updated dependencies [f02b500]
- Updated dependencies [4c23707]
  - @nl-design-system-community/clippy-a11y-validator@0.5.0
  - @nl-design-system-community/clippy-alt-text-wizard@0.2.3

## 2.0.0

### Major Changes

- ec815ff: The Clippy hub is now the only way to feed the validation components.

### Minor Changes

- fe3b84b: Expand the solution in place on a validation card, below the link to the extensive explanation, instead of swapping it for the explanation behind a Back button.
- 163628c: The validation views take their data from a Clippy hub by property.
- 7fed8f0: `<clippy-editor>` validates through a Clippy hub on its Tiptap editable instead of Lit context, and passes its Tiptap instance to its toolbar, content and bubble menu as the `editor` property.
- d7a2669: When a violation offers more than one correction, a menu button next to Correct lists the alternatives.
- 8b7248e: `clippy-validation-item` takes `corrections` instead of `correction`, and offers the first one.
- edb7e61: Every Clippy hub on a page needs its own identifier: creating a `ClippyHub` with an identifier that another hub on the page already uses throws an error.

### Patch Changes

- Updated dependencies [8aff09a]
- Updated dependencies [8b7248e]
- Updated dependencies [8b7248e]
- Updated dependencies [1139765]
  - @nl-design-system-community/clippy-a11y-validator@0.4.0

## 1.11.0

### Minor Changes

- c572413: The validations gutter is now a single tab stop: use the arrow keys, Home and End to move between its lines. The line marker beside the text is a visual indicator only, and Page review's gutter is reachable by keyboard. A line with a single validation names its button after that validation.

## 1.10.0

### Minor Changes

- 19bdc0f: Add a `floatingPosition` option to `PageReview.mount()` that puts the floating trigger in the top right or bottom right corner of the screen.

## 1.9.1

### Patch Changes

- 49f7e83: Clippy is always shown in Dutch, whatever the CMS interface language, until English copy is available.
- Updated dependencies [49f7e83]
  - @nl-design-system-community/clippy-alt-text-wizard@0.2.2

## 1.9.0

### Minor Changes

- 520bb5e: Add `ClippyHub`, exported from the new `@nl-design-system-community/editor/hub` entry. It validates an element's live DOM, waits for media inside it to settle, debounces repeated runs and feeds the result to a trigger, drawer and optional gutter that share one identifier. The CKEditor plugin now uses it, so several editors on one page no longer cancel each other's debounced validation.
- 081b960: Add Page review, exported from the new `@nl-design-system-community/editor/page-review` entry as a single self-contained ES module. Start it with `PageReview.mount(options)`.
- d8e68aa: Remove the content classes from CKEditor. CKEditor writes plain markup again: the `ContentClasses` plugin, the `contentClasses` editor config and `content-classes.json` are gone, as are Drupal's per-format **Content classes** tab and TYPO3's `Clippy` site set. The `@nl-design-system-community/editor/content-classes` entry point is removed; the Tiptap editor keeps its classes for styling.

## 1.8.3

### Patch Changes

- 024afeb: The validations drawer now moves below the editor content when they do not fit side by side, instead of squeezing the content to zero width on narrow screens and at high zoom levels.

## 1.8.2

### Patch Changes

- Updated dependencies [4125932]
- Updated dependencies [087c648]
  - @nl-design-system-community/clippy-a11y-validator@0.3.0

## 1.8.1

### Patch Changes

- Updated dependencies [17fd337]
  - @nl-design-system-community/clippy-a11y-validator@0.2.1

## 1.8.0

### Minor Changes

- 6a3702e: Add the Alt-text wizard to CKEditor.

### Patch Changes

- Updated dependencies [6a3702e]
  - @nl-design-system-community/clippy-alt-text-wizard@0.2.1

## 1.7.0

### Minor Changes

- 61fbcba: Fill the validation item card from the documentation for the rule a violation names, and give it
  two views: it opens on the explanation — what is wrong with the content — with a "Oplossing" button
  into the second view, which says how to resolve it, and a button back. That button shares a line
  with the link to the WCAG criterion, which now carries an external-link icon. Focus follows the
  view, so the keyboard lands on the button that replaced the one it activated.
  
  `clippy-validation-item` takes an `explanation` alongside its `heading`, `href` and `solution`, and
  the editor no longer resolves documentation itself — every field comes off the violation's messages.
  `documentationId` is gone from the card. The `solution-html` slot still overrides the explanation.
  
  The card no longer renders `title` and `solution` as markdown: the validator supplies the markup.

### Patch Changes

- Updated dependencies [61fbcba]
  - @nl-design-system-community/clippy-a11y-validator@0.2.0

## 1.6.0

### Minor Changes

- 6e78b92: Make the design-system content classes configurable. CKEditor reads them from the `contentClasses` editor config, and Drupal exposes them per text format, where a class can be changed or cleared.

### Patch Changes

- 8a9b19f: Restore opening the validations drawer by clicking a gutter indicator in the CKEditor plugin. The gutter now accepts a standalone `identifier` property, so hosts without a `<clippy-context>` provider can scope its drawer events to the right editor.

## 1.5.0

### Minor Changes

- e0d51ea: Expose the content classes as a package entry point: `@nl-design-system-community/editor/content-classes`.

### Patch Changes

- 47f4dc2: Fix: preserve the `start` and `type` attributes on ordered lists.

  Extending a Tiptap node with `addAttributes()` replaces the node's own attributes instead of merging with
  them. Because the `dir`/`lang` overrides did not spread `this.parent?.()`, `<ol start="5">` and `<ol type="a">`
  silently lost those attributes, resetting list numbering when existing content was loaded and saved again.

## 1.4.3

### Patch Changes

- Updated dependencies [a98b7da]
  - @nl-design-system-community/clippy-alt-text-wizard@0.2.0

## 1.4.2

### Patch Changes

- cae22af: Fix: prevent editor from rendering server side

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
