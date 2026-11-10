import type { Gutter, ValidationsDrawer } from '@nl-design-system-community/editor';
import type { AccessibilityNotifications } from '@nl-design-system-community/editor/accessibility-notifications';
import {
  ClippyAccessibilityNotifications,
  ClippyEditor,
  ClippyGutter,
  ClippyValidationsDrawer,
} from '@nl-design-system-community/editor-react';
import { ClippyHub } from '@nl-design-system-community/editor/hub';
import { useEffect, useRef } from 'react';

export function ReactEditorExample() {
  return (
    <ClippyEditor
      id="react-editor-1"
      toolbarConfig={[
        ['format-select', 'language-select'],
        ['bold', 'italic', 'underline', 'code'],
        ['link', 'image-upload', 'insert-table'],
      ]}
    >
      <div slot="value">
        <h1>Kopniveau 1 in React editor</h1>
        <p>Dit is een voorbeeld van de Clippy Editor met een Lit React wrapper</p>
      </div>
    </ClippyEditor>
  );
}

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
