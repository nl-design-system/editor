## Example 2: compose your own with a Clippy hub

To place the parts in your page yourself, create a `ClippyHub` on the element you want to validate and connect the drawer (`ClippyValidationsDrawer`), the gutter (`ClippyGutter`) and the notifications button (`ClippyAccessibilityNotifications`) to it. The hub validates the element and passes the violations to those parts as properties, so they can sit anywhere in the page. In React, `useClippyHub` from `@nl-design-system-community/editor-react/hub` creates the hub and connects the parts you give its refs to; it destroys the hub when the component unmounts. The CKEditor plugin and Page review work the same way. Click a gutter indicator (`mode="drawer"`) to open the matching validation(s) in the drawer.

The toolbar and editable area of the Clippy editor belong to `ClippyEditor` and are not separate parts to compose with.

### Example code

```tsx
import {
  ClippyAccessibilityNotifications,
  ClippyGutter,
  ClippyValidationsDrawer,
} from '@nl-design-system-community/editor-react';
import { useClippyHub } from '@nl-design-system-community/editor-react/hub';

export function ReactHubExample() {
  const { drawerRef, gutterRef, scheduleValidation, targetRef, triggerRef } = useClippyHub({
    identifier: 'react-hub-example',
  });

  return (
    <div className="clippy-hub-example">
      <ClippyAccessibilityNotifications ref={triggerRef} />
      <div className="clippy-hub-example__content">
        <div
          ref={targetRef}
          aria-multiline="true"
          contentEditable
          role="textbox"
          suppressContentEditableWarning
          onInput={scheduleValidation}
        >
          <h1>Kopniveau 1 in React</h1>
          <p></p>
          <p>
            Dit is een voorbeeld van een Clippy hub <a href="#">met de Lit React wrappers</a>
          </p>
        </div>
        <ClippyGutter ref={gutterRef} mode="drawer" />
      </div>
      <ClippyValidationsDrawer ref={drawerRef} />
    </div>
  );
}
```
