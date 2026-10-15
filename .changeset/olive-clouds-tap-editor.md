---
'@nl-design-system-community/editor': minor
---

Fill the validation item card from the documentation for the rule a violation names, and give it
two views: it opens on the explanation — what is wrong with the content — with a "Oplossing" button
into the second view, which says how to resolve it, and a button back. That button shares a line
with the link to the WCAG criterion, which now carries an external-link icon. Focus follows the
view, so the keyboard lands on the button that replaced the one it activated.

`clippy-validation-item` takes an `explanation` alongside its `heading`, `href` and `solution`, and
the editor no longer resolves documentation itself — every field comes off the violation's messages.
`documentationId` is gone from the card. The `solution-html` slot still overrides the explanation.

The card no longer renders `title` and `solution` as markdown: the validator supplies the markup.
