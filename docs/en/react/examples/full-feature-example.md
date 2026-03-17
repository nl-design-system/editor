## Example 1: simple editor

This example shows the `ClippyEditor` component — the most straightforward way to use the editor in React.

### Example code

```tsx
import { ClippyEditor } from '@nl-design-system-community/editor-react';

export function ReactEditorExample() {
  return (
    <ClippyEditor id="react-editor-1">
      <div slot="content">
        <h1>Heading level 1 in React editor</h1>
        <p>This is an example of the Clippy Editor with a Lit React wrapper</p>
      </div>
    </ClippyEditor>
  );
}
```
