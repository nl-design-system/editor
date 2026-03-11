import {
  ClippyContent,
  ClippyContext,
  ClippyEditor,
  ClippyGutter,
  ClippyToolbar,
  ClippyValidationsList,
} from '@nl-design-system-community/editor-react';

export function ReactEditorExample() {
  return (
    <ClippyEditor id="react-editor-1">
      <div slot="content">
        <h1>Kopniveau 1 in React editor</h1>
        <p>Dit is een voorbeeld van de Clippy Editor met een Lit React wrapper</p>
      </div>
    </ClippyEditor>
  );
}

export function ReactContextExample() {
  return (
    <ClippyContext id="react-editor-2">
      <div slot="content">
        <h1>Kopniveau 1 in React editor</h1>
        <p>
          Dit is een voorbeeld van de Clippy Editor <a href="#">met een Lit React wrapper</a>
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
