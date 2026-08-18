# Clippy A11y Playwright for NL Design System

An [`AxeBuilder`](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)-style
Playwright integration for the [Clippy A11y Validator](../clippy-a11y-validator).
It injects the framework-agnostic Clippy content rules into the page under test
and runs them against the **live DOM**, exactly the way `@axe-core/playwright`
injects axe-core.

Use it to gate accessibility of rendered [Clippy Editor](../editor) output — or
any HTML — from your Playwright end-to-end suite.

Learn more about NL Design System at [nldesignsystem.nl](https://nldesignsystem.nl/).

## Installation

```bash
pnpm add -D @nl-design-system-community/clippy-a11y-playwright @playwright/test
```

`@playwright/test` is a peer dependency — bring your own version (>= 1.50).

## Usage

```ts
import { test, expect } from '@playwright/test';
import ClippyBuilder from '@nl-design-system-community/clippy-a11y-playwright';

test('editor output is accessible', async ({ page }) => {
  await page.goto('http://localhost:5173/preview');

  const results = await new ClippyBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

Each violation is grouped per rule and lists the offending nodes, modelled after
axe-core's results:

```ts
{
  id: 'image-must-have-alt-text',
  severity: 'error',
  description: 'Image must have alt text',
  href: 'https://nldesignsystem.nl/...',
  nodes: [{ target: 'main > img', html: '<img src="chart.png">' }],
}
```

### Scoping and rule selection

```ts
const results = await new ClippyBuilder({ page })
  .include('.clippy-content') // audit only this region (default: document.body)
  .enableRules(['image-must-have-alt-text']) // only these rules (default: all)
  .disableRules(['paragraph-should-not-resemble-list']) // exclude rules
  .settings({ topHeadingLevel: 2 }) // highest allowed starting heading level (default: 1)
  .analyze();
```

Rule ids are accepted in `kebab-case` or `SCREAMING_SNAKE_CASE`.

## Reporting helpers

The reporting helpers from the validator are re-exported for convenience, so a
single import covers both running and reporting. They are DOM-free and run in
Node on the result returned by `analyze()`:

```ts
import ClippyBuilder, {
  formatViolations,
  assertNoViolations,
  countBySeverity,
  hasSeverityAtLeast,
} from '@nl-design-system-community/clippy-a11y-playwright';

const results = await new ClippyBuilder({ page }).analyze();

console.info(formatViolations(results)); // terminal-friendly report
countBySeverity(results); // { error, warning, info }
hasSeverityAtLeast(results, 'warning'); // boolean gate

// Fail the test on any error-level issue, printing the formatted report:
assertNoViolations(results, { failOn: 'error' });
```

## API

`new ClippyBuilder({ page })` returns a fluent builder:

| Method                           | Description                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| `.include(selector)`             | Scope analysis to the first matching element (default `document.body`) |
| `.enableRules(rules)`            | Run only these rules (default: all)                                    |
| `.disableRules(rules)`           | Exclude these rules                                                    |
| `.settings({ topHeadingLevel })` | Highest heading level the document may start at (default `1`)          |
| `.analyze()`                     | `Promise<AnalysisResult>` — inject, run, and return grouped violations |

## How it works

`analyze()` reads the validator's dependency-free ESM bundle in Node, injects it
into the page as an object-URL module, and runs `ClippyValidations` against the
scoped element in the browser. Because the rules inspect only static HTML
structure, analyzing the live DOM yields the same result as analyzing its
serialized HTML — but without leaving the browser Playwright already drives.

> **Content Security Policy:** injection uses a `blob:` module. Pages that
> forbid `script-src blob:` will block it; audit such pages against a build
> served without that restriction, or via `page.setContent()`.

## Running the tests and examples

This package's own suite doubles as executable documentation. It needs the
validator built first (the `pretest` script does this automatically):

```bash
# from the repo root
pnpm --filter @nl-design-system-community/clippy-a11y-validator run build

# run the plugin's tests + examples
pnpm --filter @nl-design-system-community/clippy-a11y-playwright run test
```

- `tests/builder.spec.ts` — exercises the builder API against inline HTML.
- `examples/editor-a11y.spec.ts` + `examples/fixture.html` — a copy-pasteable
  example that gates rendered editor output; swap `page.setContent(...)` for a
  `page.goto('<your-preview-url>')` in your own project.
