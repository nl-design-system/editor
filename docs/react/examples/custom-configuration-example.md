## Voorbeeld 2: context, content, gutter en validaties

Dit voorbeeld toont hoe `ClippyContext`, `ClippyContent`, `ClippyToolbar`, `ClippyGutter` en `ClippyValidationsList` samen gebruikt kunnen worden voor een volledig geconfigureerde editor.

### Voorbeeld code

```tsx
import {
  ClippyContent,
  ClippyContext,
  ClippyGutter,
  ClippyToolbar,
  ClippyValidationsList,
} from '@nl-design-system-community/editor-react';

export function ReactContextExample() {
  return (
    <ClippyContext id="react-editor-2" topHeadingLevel={3}>
      <div slot="value">
        <h1>Kopniveau 1 in React editor</h1>
        <p>
          Dit is een voorbeeld van de Clippy Editor <a href="#">met een Lit React wrapper</a>
        </p>
      </div>
      <ClippyToolbar
        config={[
          ['format-select', 'language-select'],
          ['bold', 'italic', 'underline', 'code'],
          ['link', 'image-upload', 'insert-table'],
        ]}
      />
      <ClippyContent>
        <ClippyGutter mode="list" />
      </ClippyContent>
      <ClippyValidationsList />
    </ClippyContext>
  );
}
```
