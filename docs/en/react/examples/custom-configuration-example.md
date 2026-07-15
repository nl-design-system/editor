## Example 2: context, content, gutter and validations

This example shows how `ClippyContext`, `ClippyEditorWrapper`, `ClippyEditorContentWrapper`, `ClippyContent`, `ClippyToolbar`, `ClippyGutter` and `ClippyValidationsDrawer` can be used together for a fully configured editor. The `ClippyEditorWrapper` places the drawer (`ClippyValidationsDrawer`) next to the content; click a gutter indicator (`mode="drawer"`) to open the matching validation(s) in the drawer.

### Example code

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
        <h1>Heading level 1 in React editor</h1>
        <p>
          This is an example of the Clippy Editor <a href="#">with a Lit React wrapper</a>
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
