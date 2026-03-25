## Example 2: context, content, gutter and validations

This example shows how `ClippyContext`, `ClippyContent`, `ClippyToolbar`, `ClippyGutter` and `ClippyValidationsList` can be used together for a fully configured editor.

### Example code

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
        <h1>Heading level 1 in React editor</h1>
        <p>
          This is an example of the Clippy Editor <a href="#">with a Lit React wrapper</a>
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
