---
title: Toolbar configuration
intro: The toolbar can be configured via the `toolbar-config` attribute. This attribute accepts a JSON array of groups, where each group is an array of `items`.
---

## Custom toolbar configuration

Below is an editor with a custom toolbar configuration: only text styles and a link button.

### Example HTML

```html
<clippy-editor
  toolbar-config='[
    ["bold", "italic", "underline"],
    ["undo", "redo"],
    ["link"]
  ]'
>
  <div slot="content">
    <p>Content here...</p>
  </div>
</clippy-editor>
```
