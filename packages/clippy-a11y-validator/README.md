# Clippy A11y Validator for NL Design System

Static accessibility validation for HTML, using the same content rules as the
[Clippy Editor](../editor). Runs anywhere a DOM is available (browser, Vitest
browser mode, Playwright) with no editor, ProseMirror, or localisation
dependencies.

Learn more about NL Design System at [nldesignsystem.nl](https://nldesignsystem.nl/).

## Usage

```ts
import {
  ClippyValidator,
  formatValidationItems,
  assertNoValidationItems,
} from '@nl-design-system-community/clippy-a11y-validator';

const { validationItems } = new ClippyValidator().validate('<h1></h1><img src="cat.png">');

console.log(formatValidationItems(validationItems));

// Fail a CI check when any error-level issue is present:
assertNoValidationItems(validationItems, { failOn: 'error' });
```

Each item is grouped per rule and lists the offending nodes:

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
new ClippyValidator()
  .enableRules(['image-must-have-alt-text']) // only these rules (default: all)
  .disableRules(['paragraph-should-not-resemble-list']) // exclude rules
  .settings({ topHeadingLevel: 2 }) // highest allowed starting heading level (default: 1)
  .validate(html);
```

Rule ids are accepted in `kebab-case` or `SCREAMING_SNAKE_CASE`.

## Reporting helpers

- `formatValidationItems(result)` — a terminal-friendly report grouped by severity.
- `countBySeverity(result)` — `{ error, warning, info }` node counts.
- `hasSeverityAtLeast(result, 'warning')` — boolean gate.
- `assertNoValidationItems(result, { failOn })` — throws the formatted report when the threshold is met.

## Corrections

Every validator attaches its own DOM fix to the result it returns, as a deferred
`correct` function — nothing is mutated until you call it. That lets a host offer
a one-click "fix this" alongside detection:

```ts
import { runValidation, validatorEvents } from '@nl-design-system-community/clippy-a11y-validator';

// Host opens its own alt-text UI when a fix asks for one.
globalThis.addEventListener(validatorEvents.OPEN_IMAGE_DIALOG, (event) => openAltTextDialog(event.detail));

for (const result of runValidation(document.body, { enableRules: ['*'] })) {
  result.correct?.(); // not every rule ships a fix
}
```

The fixes mutate plain DOM and take no editor dependency. The one interactive fix
— "add alt text" — surfaces its request as a generic `clippy:open-image-dialog`
event on `globalThis`, so any host can listen without the corrector holding a
reference to it.

### Calling a fix directly (`/correctors`)

The underlying `correct*` functions are also exported on their own:

```ts
import { correctEmptyHeading } from '@nl-design-system-community/clippy-a11y-validator/correctors';

correctEmptyHeading(document.querySelector('h1')!)(); // removes the empty heading
```

> **Note:** the definition-term placeholder is currently hard-coded (`"definition term"`) and not localized — see the `TODO` in `src/components/definition-list/corrector.ts`.

## Package layout

One folder per [NL Design System component](https://nldesignsystem.nl/componenten),
each owning its whole vertical slice:

```text
src/components/heading/
  rules.ts      pure predicates — "does this element break the guideline?"
  corrector.ts  the deferred DOM fixes for those rules
  index.ts      binds rule + correction into validators, keyed by rule id
```

Rules take DOM and return a verdict: no severity, no correction, no
`ValidationResult`. That keeps them unit-testable on a detached document
(`rules.test.ts` next to each one) and reusable inside custom validators.

`src/detection.ts` holds the engine that filters the active rules and runs them;
`src/components/index.ts` is the only module that knows every component.

### Custom rules

A custom rule is just a `ContentValidator` that returns its own `correct` — the
same shape the built-ins use, with no registry to register against:

```ts
const linkNewTabShouldWarn: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'A' || (node as HTMLAnchorElement).target !== '_blank') return null;
  const name = (node.getAttribute('aria-label') ?? node.textContent ?? '').trim();
  if (/new (tab|window)|opens in/i.test(name)) return null;
  return {
    correct: () => node.setAttribute('aria-label', `${name} (opens in a new tab)`.trim()),
    element: node,
    scope: 'inline',
    severity: 'warning',
  };
};
```

Detection stays yours to drive — the built-in `runValidation` only walks the
shipped validator maps, so run your validator yourself and tag each result with
your rule id. A full, runnable end-to-end example lives in
[`test/examples/customValidation.ts`](./test/examples/customValidation.ts).

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
    .validate();

  expect(results.validationItems).toEqual([]);
});
```

The reporting helpers above are re-exported from `/playwright` too, so a single
import covers both running and reporting.

`validate()` reads the validator's dependency-free ESM bundle in Node, injects it
into the page as an object-URL module, and runs `ClippyValidator` against the
scoped element in the browser.

> **Content Security Policy:** injection uses a `blob:` module. Pages that forbid
> `script-src blob:` will block it; audit such pages against a build served
> without that restriction, or via `page.setContent()`.

The Playwright suite under `playwright/` doubles as executable documentation:
`playwright/tests/builder.spec.ts` exercises the builder API against inline HTML,
and `playwright/examples/` holds a copy-pasteable example that gates rendered
editor output.

## Running in the terminal

The validator needs a DOM. The package's own tests run under Vitest in browser
mode (Playwright/Chromium); point Vitest at a spec that reads your HTML fixtures
and calls `validate()`, then run `pnpm test`.
