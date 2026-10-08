---
'@nl-design-system-community/clippy-a11y-validator': minor
---

Let a validation name the rule in `@nl-design-system-unstable/documentation` that explains it, through
`documentationId`. The id travels to the host on the violation, so a host can show the documentation
for a rule rather than the one-line copy the validation carries. Eight core validations name one:
every heading, link and paragraph rule the documentation package describes.

Validation copy is plain text now rather than markdown, so
`PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING` no longer wraps the element name it quotes in
backticks.
