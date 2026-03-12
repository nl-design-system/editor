## Voorbeeld 2: context, content, gutter en validaties

Dit voorbeeld toont hoe `ClippyContext`, `ClippyContent`, `ClippyToolbar`, `ClippyGutter` en `ClippyValidationsList` samen gebruikt kunnen worden voor een volledig geconfigureerde editor.

### Voorbeeld code

```tsx
import { ClippyContent } from '@nl-design-system-community/editor-react';
import { ClippyContext } from '@nl-design-system-community/editor-react';
import { ClippyGutter } from '@nl-design-system-community/editor-react';
import { ClippyToolbar } from '@nl-design-system-community/editor-react';
import { ClippyValidationsList } from '@nl-design-system-community/editor-react';

export function ReactContextExample() {
  return (
    <ClippyContext id="react-editor-2">
      <div slot="content">
        <h1>Kopniveau 1 in React editor</h1>
        <p>
          Dit is een voorbeeld van de Clippy Editor <a href="#">met een Lit React wrapper</a>
        </p>
      </div>
      <ClippyContent>
        <ClippyToolbar
          config={[
            ['format-select', 'language-select'],
            ['bold', 'italic', 'underline', 'code'],
            ['link', 'image-upload', 'insert-table'],
          ]}
        />
        <ClippyGutter mode="list" />
      </ClippyContent>
      <ClippyValidationsList />
    </ClippyContext>
  );
}
```
