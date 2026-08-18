# Clippy A11y Validator for NL Design System

Static accessibility analysis for HTML, using the same content rules as the
[Clippy Editor](../editor). Runs anywhere a DOM is available (browser, Vitest
browser mode, Playwright) with no editor, ProseMirror, or localisation
dependencies.

Learn more about NL Design System at [nldesignsystem.nl](https://nldesignsystem.nl/).

## Usage

```ts
import {
  ClippyValidations,
  formatViolations,
  assertNoViolations,
} from '@nl-design-system-community/clippy-a11y-validator';

const { violations } = new ClippyValidations().analyze('<h1></h1><img src="cat.png">');

console.log(formatViolations(violations));

// Fail a CI check when any error-level issue is present:
assertNoViolations(violations, { failOn: 'error' });
```

Each violation is grouped per rule and lists the offending nodes:

```ts
{
  id: 'heading-must-not-be-empty',
  severity: 'error',
  description: 'Heading must not be empty',
  href: 'https://nldesignsystem.nl/...',
  nodes: [{ target: 'h1', html: '<h1></h1>' }],
}
```

### Selecting rules

```ts
new ClippyValidations()
  .enableRules(['image-must-have-alt-text']) // only these rules (default: all)
  .disableRules(['paragraph-should-not-resemble-list']) // exclude rules
  .settings({ topHeadingLevel: 2 }) // highest allowed starting heading level (default: 1)
  .analyze(html);
```

Rule ids are accepted in `kebab-case` or `SCREAMING_SNAKE_CASE`.

## Reporting helpers

- `formatViolations(result)` — a terminal-friendly report grouped by severity.
- `countBySeverity(result)` — `{ error, warning, info }` node counts.
- `hasSeverityAtLeast(result, 'warning')` — boolean gate.
- `assertNoViolations(result, { failOn })` — throws the formatted report when the threshold is met.

## Corrections (`/correctors`)

The DOM fixes that back each rule are available separately, so a host can offer
a one-click "fix this" alongside detection. They mutate plain DOM and take no
editor or event-bus dependency — host-specific bits (a localized placeholder,
how an "add alt text" request is surfaced) are passed in:

```ts
import { correctEmptyHeading } from '@nl-design-system-community/clippy-a11y-validator/correctors';

correctEmptyHeading(document.querySelector('h1')!)(); // removes the empty heading
```

## Playwright integration (`/playwright`)

An [`AxeBuilder`](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)-style
Playwright integration injects the framework-agnostic rules into the page under
test and runs them against the **live DOM**, exactly the way `@axe-core/playwright`
injects axe-core. `@playwright/test` is a peer dependency — bring your own
version (>= 1.50).

```ts
import { test, expect } from '@playwright/test';
import ClippyBuilder from '@nl-design-system-community/clippy-a11y-validator/playwright';

test('editor output is accessible', async ({ page }) => {
  await page.goto('http://localhost:5173/preview');

  const results = await new ClippyBuilder({ page })
    .include('.clippy-content') // audit only this region (default: document.body)
    .enableRules(['image-must-have-alt-text']) // only these rules (default: all)
    .disableRules(['paragraph-should-not-resemble-list']) // exclude rules
    .settings({ topHeadingLevel: 2 }) // highest allowed starting heading level (default: 1)
    .analyze();

  expect(results.violations).toEqual([]);
});
```

The reporting helpers above are re-exported from `/playwright` too, so a single
import covers both running and reporting.

`analyze()` reads the validator's dependency-free ESM bundle in Node, injects it
into the page as an object-URL module, and runs `ClippyValidations` against the
scoped element in the browser.

> **Content Security Policy:** injection uses a `blob:` module. Pages that forbid
> `script-src blob:` will block it; audit such pages against a build served
> without that restriction, or via `page.setContent()`.

The Playwright suite under `playwright/` doubles as executable documentation:
`playwright/tests/builder.spec.ts` exercises the builder API against inline HTML,
and `playwright/examples/` holds a copy-pasteable example that gates rendered
editor output.

## Running in the terminal

The analyzer needs a DOM. The package's own tests run under Vitest in browser
mode (Playwright/Chromium); point Vitest at a spec that reads your HTML fixtures
and calls `analyze()`, then run `pnpm test`.
