## Example 2: compose your own with a Clippy hub

To place the parts in your page yourself, create a `ClippyHub` on the element you want to validate and connect the drawer (`ClippyValidationsDrawer`), the gutter (`ClippyGutter`) and the notifications button (`ClippyAccessibilityNotifications`) to it. The hub validates the element and passes the violations to those parts as properties, so they can sit anywhere in the page. The CKEditor plugin and Page review work the same way. Click a gutter indicator (`mode="drawer"`) to open the matching validation(s) in the drawer.

The toolbar and editable area of the Clippy editor belong to `ClippyEditor` and are not separate parts to compose with.

### Example code

```tsx
import type { Gutter, ValidationsDrawer } from '@nl-design-system-community/editor';
import type { AccessibilityNotifications } from '@nl-design-system-community/editor/accessibility-notifications';
import { ClippyHub } from '@nl-design-system-community/editor/hub';
import {
  ClippyAccessibilityNotifications,
  ClippyGutter,
  ClippyValidationsDrawer,
} from '@nl-design-system-community/editor-react';
import { useEffect, useRef } from 'react';

export function ReactHubExample() {
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<AccessibilityNotifications>(null);
  const gutterRef = useRef<Gutter>(null);
  const drawerRef = useRef<ValidationsDrawer>(null);
  const hubRef = useRef<ClippyHub | null>(null);

  useEffect(() => {
    const target = contentRef.current!;
    const hub = new ClippyHub({ identifier: 'react-hub-example', target });
    gutterRef.current!.contentElement = target;
    hub.connect({ drawer: drawerRef.current, gutter: gutterRef.current, trigger: triggerRef.current });
    hub.validate().catch(console.error);
    hubRef.current = hub;
    return () => {
      hub.destroy();
      hubRef.current = null;
    };
  }, []);

  return (
    <div className="clippy-hub-example">
      <ClippyAccessibilityNotifications ref={triggerRef} />
      <div className="clippy-hub-example__content">
        <div
          ref={contentRef}
          aria-multiline="true"
          contentEditable
          role="textbox"
          suppressContentEditableWarning
          onInput={() => hubRef.current?.scheduleValidation()}
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
