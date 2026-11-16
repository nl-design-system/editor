# @nl-design-system-community/clippy-a11y-validator

## 0.4.0

### Minor Changes

- 8aff09a: `clippy-validate-html` replaces `--fix` with `--diff`, which applies the corrections and shows how each document changes, without writing anything to disk. When an issue offers more than one correction, it asks which one to apply. `--diff` no longer forces exit code 0.
- 8b7248e: Export `getPrimaryCorrection` and `getAlternativeCorrections`, which split a violation's corrections into the one a host offers first and any number of alternatives.
- 8b7248e: A validation now offers a list of `corrections`, primary first, instead of a single `correction`. **Breaking:** read `violation.corrections?.[0]` where you read `violation.correction`.
- 1139765: Entirely bold paragraphs can also be converted to a heading, and entirely italic paragraphs to a blockquote.

## 0.3.0

### Minor Changes

- 4125932: `clippy-validate-html` still reports issues of info severity, but no longer exits with 1 when those are the only ones found. Add `--allow-warnings` to also exit with 0 on warnings, failing only on errors.
- 087c648: Add the `PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_ITALIC` and `PARAGRAPH_SHOULD_NOT_CONTAIN_MULTIPLE_TEXT_BLOCKS` validations, which report a paragraph that is entirely italic and text blocks in one paragraph that are separated only by blank lines.

## 0.2.1

### Patch Changes

- 17fd337: Validate documents whose Content Security Policy would otherwise block the injected validator script.

## 0.2.0

### Minor Changes

- 61fbcba: Shape a violation's messages like a rule in `@nl-design-system-unstable/documentation`, and fill
  them from one when the validation names a `documentationId`.
  
  `messages.error` is now `messages.title`, and `ResolvedMessages` gains an `explanation`. The title
  names the rule rather than this violation, so a named rule's title always wins; `explanation` and
  `solution` are the other way round, with the validation's own words over the documentation's. Eight
  core validations name a rule — every heading, link and paragraph rule the documentation describes —
  and write only what the documentation cannot: the heading level they found, the link text they read.
  
  `explanation` and `solution` are HTML, written as the documentation writes it, and a validation now
  writes its own markup rather than plain text. `title` stays plain text. Every field is optional, so
  between a validation's own copy and the rule it names something has to name the issue; nothing in
  the type system can say that, so a test holds every core validation to it.
  
  A placeholder is the exception: `{text}` and `{prefix}` carry an author's own content, so values are
  escaped as they land in the HTML fields while the copy around them is passed through untouched.
  
  The CLI prints the title and the offending markup; `explanation` and `solution` are HTML for a host to render, so it leaves them out.
  
  `ValidationDocumentation` is gone, along with the nested `messages.documentation` it typed.
