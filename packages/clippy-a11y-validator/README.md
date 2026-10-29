# `clippy-a11y-validator`: Accessibility validator for HTML for (headless) browsers

Checks HTML content against the content guidelines of NL Design System: headings, paragraphs, lists, links, images,
tables and description lists. Each issue comes with a message in Dutch, a link to the guideline and, where
the fix is unambiguous, a correction the validator can apply itself.

`clippy-a11y-validator` is the core validator of the Clippy editor, checking content while an author writes, and runs
from the command line against published HTML.

- Check out _demo_ and documentation on [editor.nl-design-system-community.nl](https://editor.nl-design-system-community.nl)
- Learn more about NL Design System at [nldesignsystem.nl](https://nldesignsystem.nl/).

## Installation

```sh
npm install @nl-design-system-community/clippy-a11y-validator
```

The command line tool runs the validator in a browser, so it also needs Playwright and Chromium:

```sh
npm install --save-dev playwright
npx playwright install chromium
```

## Command line

```sh
npx clippy-validate-html <path...> [options]
```

Each path is an `.html` or `.htm` file, or a directory to search for them.

| Option              | Description                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--allow-warnings`  | Exit with `0` when no issues of `error` severity are found.                                                                                      |
| `--fix`             | Apply the available corrections. The files on disk stay untouched: the output shows the markup as it is after correcting.                        |
| `--skip <selector>` | Remove everything matching this CSS selector before validating, e.g. demo markup that is wrong on purpose. Repeat the option for more selectors. |
| `--help`, `-h`      | Show the usage.                                                                                                                                  |

Every issue is printed with its severity, rule, title and the offending markup:

```text
dist/index.html
warning: PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD — Hele alinea is dikgedrukt
  <p><b>De aanvraag duurt vijf werkdagen.</b></p>

1 issue(s) found in 1 document(s).
```

### Exit codes

| Code | Meaning                                                                                            |
| ---- | -------------------------------------------------------------------------------------------------- |
| `0`  | No issues found, only issues of `info` severity, or `--fix` was given.                             |
| `1`  | At least one issue of `error` severity found, or of `warning` severity without `--allow-warnings`. |
| `2`  | The arguments are unusable: a missing path, a file that is not HTML, an invalid selector.          |

Issues of `info` severity are printed but never fail the run, so the tool can guard a build in CI without blocking on
suggestions. Add `--allow-warnings` to fail only on errors.

## Library

### Validating content

```ts
import { coreValidations, Validator } from '@nl-design-system-community/clippy-a11y-validator';

const validator = new Validator({ validations: Object.values(coreValidations) });

const violations = validator.validate([document.querySelector('main')!]);

for (const { element, messages, rule, severity } of violations) {
  console.log(severity, rule, messages.title, element);
}
```

`validate()` takes the parts of the page to check: elements or document fragments. They are checked in place, not
copied, so every violation points at the live element.

Pass `severities` to run only some of the validations:

```ts
validator.validate([content], { severities: ['error', 'warning'] });
```

### Violations

Each violation has:

| Property     | Description                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `rule`       | The rule that was violated, e.g. `HEADING_MUST_NOT_BE_EMPTY`.                                                    |
| `severity`   | `error`, `warning` or `info`.                                                                                    |
| `element`    | The element that violates the rule.                                                                              |
| `messages`   | `title` (plain text), `explanation` and `solution` (HTML) and `href`, a link to the guideline.                   |
| `correction` | Present when the validator can fix the issue: call `correction.execute()` to change the element.                 |
| `focus`      | Present when the validation defines one; call it to move focus to the offending markup.                          |
| `scope`      | `element` when the element has issues in itself, `document` when the issue lies in its relation to the document. |

`explanation` and `solution` are HTML. Placeholders filled with the author's own content are escaped, but render them
as HTML only in a context where that is safe.

### Locales

The core validations have messages in Dutch (`nl`, the default) only. A validation can add English (`en`) messages;
a message that is missing in `locale` falls back to `fallbackLocale`, which defaults to `nl`.

### Writing your own validation

```ts
import { defineValidation, validationSeverity } from '@nl-design-system-community/clippy-a11y-validator';

const abbreviationMustHaveTitle = defineValidation({
  condition: (abbr) => abbr.title.trim() !== '',
  messages: {
    en: { title: 'Abbreviation has no expansion' },
    nl: { title: 'Afkorting heeft geen uitleg' },
  },
  rule: 'ABBREVIATION_MUST_HAVE_TITLE',
  scope: 'element',
  selector: 'abbr',
  severity: validationSeverity.WARNING,
});

const unregister = validator.register(abbreviationMustHaveTitle);
```

`condition` returns `true` when the element is fine. A `document` scoped validation also receives a context to look at
the elements before and after it. Add `correction` for a fix the validator can apply, and `payload` to fill
placeholders such as `{text}` in the messages.

## Rules

Each rule lives in its own folder under [`src/components`](src/components), grouped by element, e.g.
[`src/components/heading/must-not-be-empty`](src/components/heading/must-not-be-empty). `coreValidationRules` exports
the rule names, and `coreValidations` the validations themselves.
