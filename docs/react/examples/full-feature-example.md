## Voorbeeld 1: eenvoudige editor

Dit voorbeeld toont de `ClippyEditor` component — de meest eenvoudige manier om de editor in React te gebruiken.

### Voorbeeld code

```tsx
import { ClippyEditor } from '@nl-design-system-community/editor-react';

export function ReactEditorExample() {
  return (
    <ClippyEditor id="react-editor-1">
      <div slot="content">
        <h1>Kopniveau 1 in React editor</h1>
        <p>Dit is een voorbeeld van de Clippy Editor met een Lit React wrapper</p>
      </div>
    </ClippyEditor>
  );
}
```
