# @nl-design-system-community/clippy-a11y-validator

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
