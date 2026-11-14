## Voorbeeld 2: zelf samenstellen met een Clippy hub

Wil je de onderdelen zelf in je pagina plaatsen, dan maak je een `ClippyHub` aan op het element dat je wilt valideren en koppel je daar de lade (`ClippyValidationsDrawer`), de gutter (`ClippyGutter`) en de knop met meldingen (`ClippyAccessibilityNotifications`) aan. De hub valideert het element en geeft de meldingen als properties aan die onderdelen door, zodat ze overal in de pagina kunnen staan. Zo werken ook de CKEditor-plugin en Page review. Klik op een item in de gutter (`mode="drawer"`) om de bijbehorende validatie(s) in de lade te openen.

De werkbalk en het bewerkbare gebied van de Clippy editor horen bij `ClippyEditor` en zijn geen losse onderdelen om mee samen te stellen.

### Voorbeeld code

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
