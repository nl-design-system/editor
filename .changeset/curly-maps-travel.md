---
"@nl-design-system-community/clippy-a11y-validator": minor
---

`clippy-validate-html` still reports issues of info severity, but no longer exits with 1 when those are the only ones found. Add `--allow-warnings` to also exit with 0 on warnings, failing only on errors.
