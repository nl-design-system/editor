import 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fira-sans/400.css';
import '@fontsource/fira-sans/700.css';
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/700.css';
import '@nl-design-system-community/ma-design-tokens/dist/theme.css';
import '@utrecht/component-library-css/dist/index.css';
import '@utrecht/design-tokens/dist/theme.css';
import '@nl-design-system-community/editor/theme.css';
import { ClippyEditor } from './components/Editor.tsx';

const root = createRoot(document.getElementById('app')!);

root.render(
  <>
    <h1>Clippy Editor (React)</h1>
    <hr />
    <h2>React editor example</h2>
    <ClippyEditor
      id="react-editor-1"
      toolbar-config={[
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
  </>,
);
