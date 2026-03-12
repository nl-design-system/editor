---
title: Toolbar configuratie
intro: De toolbar kan geconfigureerd worden via het `toolbar-config` attribuut. Dit attribuut accepteert een JSON-array van groepen, waarbij elke groep een array van `items` is.
---

## Custom toolbar configuratie

Hieronder staat een editor met een custom toolbar configuratie: alleen tekststijlen en een link-knop.

### Voorbeeld HTML

```html
<clippy-editor
  toolbar-config='[
    ["bold", "italic", "underline"],
    ["undo", "redo"],
    ["link"]
  ]'
>
  <div slot="content">
    <p>Inhoud hier...</p>
  </div>
</clippy-editor>
```

## Live configuratie demo

Pas de JSON aan en zie de toolbar direct veranderen.
