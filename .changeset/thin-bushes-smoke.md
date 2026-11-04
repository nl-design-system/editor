---
"@nl-design-system-community/clippy-a11y-validator": minor
---

A validation now offers a list of `corrections`, primary first, instead of a single `correction`. Entirely bold paragraphs can also be converted to a heading, and entirely italic paragraphs to a blockquote. **Breaking:** read `violation.corrections?.[0]` where you read `violation.correction`.
