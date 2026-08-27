---
title: Playwright integration
intro: The Playwright integration audits published editor output in a real browser. The validator is injected into the page under test and runs against the live DOM, the same way @axe-core/playwright injects axe-core.
---

## Installation

The integration ships inside the `@nl-design-system-community/clippy-a11y-validator` package, under
the `/playwright` subpath. `@playwright/test` is a peer dependency, so you bring your own version
(1.50 or higher).

```bash
npm install --save-dev @nl-design-system-community/clippy-a11y-validator @playwright/test
```

> **Not on npm yet:** the package has not been published. Inside this monorepo, depend on it with
> `"@nl-design-system-community/clippy-a11y-validator": "workspace:*"`; the command above works once
> the first version is released.

## Quick start

`ClippyBuilder` is a fluent API in the style of `AxeBuilder`. Pass it the Playwright `page`,
optionally scope the region to audit, and call `validate()`.

```ts
import { test, expect } from '@playwright/test';
import ClippyBuilder from '@nl-design-system-community/clippy-a11y-validator/playwright';

test('editor output is accessible', async ({ page }) => {
  await page.goto('http://localhost:5173/preview');

  const results = await new ClippyBuilder({ page }).include('.clippy-content').validate();

  expect(results.validationItems).toEqual([]);
});
```

## The builder API

Every configuration method returns the builder, so calls can be chained. `validate()` ends the chain
and resolves to the report.

```ts
const results = await new ClippyBuilder({ page })
  .include('.clippy-content') // audit only this region (default: document.body)
  .enableRules(['image-must-have-alt-text']) // only these rules (default: all)
  .disableRules(['paragraph-should-not-resemble-list']) // exclude rules
  .settings({ topHeadingLevel: 2 }) // highest allowed starting heading level (default: 1)
  .validate();
```

| Method                | Purpose                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `include(selector)`   | Scopes validation to the first element matching `selector`. Without `include`, `document.body` is audited. |
| `enableRules(rules)`  | Limits validation to the given rules. Accepts kebab-case or SCREAMING_SNAKE_CASE.                          |
| `disableRules(rules)` | Excludes the given rules.                                                                                  |
| `settings(settings)`  | Non-rule settings, such as `topHeadingLevel`.                                                              |
| `validate()`          | Injects the validator, runs it against the live DOM and returns a `ValidationReport`.                      |

## The report

`validate()` resolves to a `ValidationReport` holding a single `validationItems` array. Each item is
grouped per rule and lists every place it applies, mirroring axe-core:

```ts
{
  id: 'heading-must-not-be-empty',
  severity: 'error',
  description: 'Heading must not be empty',
  href: 'https://nldesignsystem.nl/...',
  nodes: [{ target: 'h1', html: '<h1></h1>' }],
}
```

`severity` is `'error'`, `'warning'` or `'info'`. `target` is a CSS selector relative to the validated
root, and `html` is the element's truncated `outerHTML`.

## Reporting and failing the build

The reporting helpers from the main package are re-exported from `/playwright` too, so a single import
covers both running and reporting.

```ts
import ClippyBuilder, {
  assertNoValidationItems,
  countBySeverity,
  formatValidationItems,
  hasSeverityAtLeast,
} from '@nl-design-system-community/clippy-a11y-validator/playwright';

const results = await new ClippyBuilder({ page }).include('.clippy-content').validate();

// A readable, terminal-friendly report.
console.info(formatValidationItems(results));

// Counts per severity, for example { error: 1, warning: 0, info: 2 }.
countBySeverity(results);

// True as soon as any item sits at or above this threshold.
hasSeverityAtLeast(results, 'warning');

// Throws with the formatted report as its message: the build gate.
assertNoValidationItems(results, { failOn: 'error' });
```

`assertNoValidationItems` fails on `'error'` by default. Set `failOn` to `'warning'` or `'info'` to be
stricter. Because the thrown message is the full report, the Playwright output shows exactly which
elements caused the failure.

## Playwright configuration

When your specs fill the page with `page.setContent()`, no dev server is needed:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: 'list',
  testDir: './tests',
});
```

To audit a running application, use `webServer` and `use.baseURL` as you normally would with
Playwright, and navigate with `page.goto()` to the page that renders the editor output.

## How it works

In Node, `validate()` reads the validator's dependency-free ESM bundle, injects it into the page as an
object-URL module, and runs `ClippyValidator` against the scoped element in the browser. Because
validation happens in the browser, the DOM as actually rendered is audited, including anything
client-side scripts changed.

> **Content Security Policy:** injection uses a `blob:` module. Pages that forbid `script-src blob:`
> will block it. Audit such pages against a build served without that restriction, or via
> `page.setContent()`.

Since the validator itself carries no editor, ProseMirror or localisation dependencies, this
integration can audit output that was not produced by the Clippy Editor at all.
