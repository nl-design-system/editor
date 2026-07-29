# Clippy A11y Validator — Chromium extension

A Manifest V3 browser extension that validates the HTML content of the current
tab against the NL Design System [Clippy accessibility rules](../clippy-a11y-validator),
right from the toolbar. It injects the framework-agnostic validator into the
page, runs it against the live DOM, and lists the violations grouped by rule —
click any result to highlight the offending element on the page.

Learn more about NL Design System at [nldesignsystem.nl](https://nldesignsystem.nl/).

## How it works

- **`src/inject.ts`** is bundled as a self-contained IIFE (the validator is
  inlined) and injected into the active tab with
  `chrome.scripting.executeScript`. It exposes `window.__clippyA11y` in the
  extension's isolated world.
- **`src/popup.ts`** (the toolbar popup) asks the injected script to analyze the
  page — optionally scoped to a CSS selector — and renders each violation with
  the shared **`<clippy-validation-item>`** card from
  [`@nl-design-system-community/editor/validation-item`](../editor), so the
  results look identical to the editor's own validation drawer. Clicking a
  result outlines and scrolls to the element.
- **`src/tracker.ts`** is a tiny always-on content script that records the last
  right-clicked element (the context-menu API gives no reference to it).
- **`src/background.ts`** (service worker) registers the **"Inspect element with
  Clippy"** context-menu item. On click it validates just the right-clicked
  element, stores the result, and opens the popup to show it (see below).

The card's NL Design System styling relies on design tokens, so the popup also
imports `ma-design-tokens`, `@utrecht/design-tokens`, and the editor's
`theme.css`, and wraps its body in `ma-theme clippy-theme utrecht-root`.

## Inspect a single element (right-click)

Right-click any element on a page and choose **"Inspect element with Clippy"**.
The extension validates that element and its subtree (document-level heading
rules are skipped, since they are whole-page concerns) and opens the popup with
the results, headed by the element you picked (e.g. `img.hero`).

Because `runValidation` only checks a root's descendants, the element is
analyzed via its own `outerHTML` so the element itself is included — right-click
an `<img>` and its missing `alt` is reported.

> Some browsers can't focus the popup programmatically; if it doesn't pop up, a
> red badge count appears on the toolbar icon — click it to see the result.
> Right-clicks inside cross-origin iframes fall back to the frame's `<body>`.

## Permissions

The extension requests `activeTab` + `scripting` (only touches a page when you
invoke it), `contextMenus` (the right-click item), and `storage` (to hand the
inspection result to the popup). The tracker content script matches
`<all_urls>`, but does nothing beyond noting the last right-clicked element.

## Build

```bash
# from the repo root — builds the validator first, then the extension
pnpm --filter @nl-design-system-community/clippy-a11y-chromium-extension run build
```

The unpacked extension is written to `packages/clippy-a11y-chromium-extension/dist/`:

```text
dist/
  manifest.json
  popup.html
  inject.js          # self-contained validator + page runner
  background.js      # service worker (context menu)
  tracker.js         # content script (records right-clicked element)
  assets/            # popup bundle (JS + CSS)
```

## Load it in Chrome / Edge

1. Build the extension with `run build` (writes `dist/`).
2. Open `edge://extensions` (or `chrome://extensions`).
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the `dist/` folder (the one containing
   `manifest.json`).
5. Pin the extension, open any page, and click the toolbar icon → **Validate
   page**.

After changing the source, re-run the build and press **Reload** on the
extension card.

## Usage notes

- **Scope selector** — leave empty to check the whole `<body>`, or enter a CSS
  selector (e.g. `.clippy-content`, `main`) to check only that region. This is
  usually what you want when auditing embedded editor output on a busy page.
- **Copy report** — copies the same terminal-style report produced by the
  validator's `formatViolations()` helper to the clipboard.
- **Restricted pages** — Chrome blocks extensions from scripting `chrome://`,
  the Web Store, and other privileged pages; the popup shows an error there.
- **Strict CSP pages** — element highlighting sets an inline `outline` style,
  which a very strict page Content Security Policy may ignore. Validation itself
  is unaffected.

## Relation to the other packages

This extension shares its rules with:

- [`clippy-a11y-validator`](../clippy-a11y-validator) — the framework-agnostic
  engine (used here in the page).
- [`clippy-a11y-playwright`](../clippy-a11y-playwright) — the same checks as an
  `AxeBuilder`-style Playwright integration for automated tests.
