## Voorbeeld 2: context, content, gutter en validaties

Dit voorbeeld toont hoe `ClippyContext`, `ClippyEditorWrapper`, `ClippyEditorContentWrapper`, `ClippyContent`, `ClippyToolbar`, `ClippyGutter` en `ClippyValidationsDrawer` samen gebruikt kunnen worden voor een volledig geconfigureerde editor. De `ClippyEditorWrapper` plaatst de lade (`ClippyValidationsDrawer`) naast de inhoud; klik op een item in de gutter (`mode="drawer"`) om de bijbehorende validatie(s) in de lade te openen.

### Voorbeeld code

```tsx
import {
  ClippyContent,
  ClippyContext,
  ClippyEditorContentWrapper,
  ClippyEditorWrapper,
  ClippyGutter,
  ClippyToolbar,
  ClippyValidationsDrawer,
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
      <ClippyEditorWrapper>
        <ClippyEditorContentWrapper>
          <ClippyToolbar
            config={[
              ['format-select', 'language-select'],
              ['bold', 'italic', 'underline', 'code'],
              ['link', 'image-upload', 'insert-table'],
            ]}
          />
          <ClippyContent>
            <ClippyGutter mode="drawer" />
          </ClippyContent>
        </ClippyEditorContentWrapper>
        <ClippyValidationsDrawer />
      </ClippyEditorWrapper>
    </ClippyContext>
  );
}
```
