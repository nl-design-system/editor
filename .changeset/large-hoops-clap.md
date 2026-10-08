---
'@nl-design-system-community/editor': minor
---

Fill the validation item card with the documentation for the rule a violation names. The card reads
`@nl-design-system-unstable/documentation`, and shows that rule's explanation, every solution it
offers and the guidelines it relates to, in place of the single line of copy the validation carries.
A rule the documentation does not describe yet still shows that copy.

The card no longer renders its `heading` and `solution` as markdown: both are plain text, and the
documentation supplies the markup. `clippy-validation-item` takes the rule through a new
`documentationId` property; the `solution-html` slot still overrides everything.
