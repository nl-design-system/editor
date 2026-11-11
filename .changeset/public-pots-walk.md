---
"@nl-design-system-community/clippy-a11y-validator": minor
---

Breaking: `clippy-validate-html` replaces `--fix` with `--diff`, which applies the corrections and shows how each document changes, without writing anything to disk. When an issue offers more than one correction, it asks which one to apply. `--diff` no longer forces exit code 0.
