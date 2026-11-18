## Voorbeeld 2: zelf samenstellen met een Clippy hub

Wil je de onderdelen zelf in je pagina plaatsen, dan maak je een `ClippyHub` aan op het element dat je wilt valideren en koppel je daar de gutter (`ClippyGutter`) en de knop met meldingen (`ClippyAccessibilityNotifications`) aan. De hub valideert het element en geeft de meldingen als properties aan die onderdelen door, zodat ze overal in de pagina kunnen staan. De lade maakt de hub zelf aan en zet hem vast aan de rechterkant van het scherm; zolang hij open is, wordt de pagina even veel smaller. In React maakt `useClippyHub` uit `@nl-design-system-community/editor-react/hub` de hub aan en koppelt het de onderdelen die je zijn refs geeft; als het component unmount, ruimt de hook de hub op. Zo werken ook de CKEditor-plugin en Page review. Klik op een item in de gutter (`mode="drawer"`) om de bijbehorende validatie(s) in de lade te openen.

De werkbalk en het bewerkbare gebied van de Clippy editor horen bij `ClippyEditor` en zijn geen losse onderdelen om mee samen te stellen.

### Voorbeeld code

```tsx
import { ClippyAccessibilityNotifications, ClippyGutter } from '@nl-design-system-community/editor-react';
import { useClippyHub } from '@nl-design-system-community/editor-react/hub';

export function ReactHubExample() {
  const { gutterRef, scheduleValidation, targetRef, triggerRef } = useClippyHub({
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
    </div>
  );
}
```
