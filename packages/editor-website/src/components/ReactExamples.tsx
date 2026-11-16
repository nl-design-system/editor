import {
  ClippyAccessibilityNotifications,
  ClippyEditor,
  ClippyGutter,
  ClippyValidationsDrawer,
} from '@nl-design-system-community/editor-react';
import { useClippyHub } from '@nl-design-system-community/editor-react/hub';

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
            Dit is een voorbeeld van een Clippy hub{' '}
            <a href="https://lit.dev/docs/frameworks/react/">met de Lit React wrappers</a>
          </p>
        </div>
        <ClippyGutter ref={gutterRef} mode="drawer" />
      </div>
      <ClippyValidationsDrawer ref={drawerRef} />
    </div>
  );
}
