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
  .withRules(['image-must-have-alt-text']) // only these rules (default: all)
  .withoutRules(['paragraph-should-not-resemble-list']) // exclude rules
  .withTopHeadingLevel(2) // highest allowed starting heading level (default: 1)
  .analyze(html);
```

Rule ids are accepted in `kebab-case` or `SCREAMING_SNAKE_CASE`.

## Reporting helpers

- `formatViolations(result)` — a terminal-friendly report grouped by severity.
- `countBySeverity(result)` — `{ error, warning, info }` node counts.
- `hasSeverityAtLeast(result, 'warning')` — boolean gate.
- `assertNoViolations(result, { failOn })` — throws the formatted report when the threshold is met.

## Running in the terminal

The analyzer needs a DOM. The package's own tests run under Vitest in browser
mode (Playwright/Chromium); point Vitest at a spec that reads your HTML fixtures
and calls `analyze()`, then run `pnpm test`.
