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
import { ClippyContent } from './components/Content.tsx';
import { ClippyContext } from './components/Context.tsx';
import { ClippyEditor } from './components/Editor.tsx';
import { ClippyGutter } from './components/Gutter.tsx';
import { ClippyToolbar } from './components/Toolbar.tsx';
import { ClippyValidationsList } from './components/ValidationList.tsx';

const root = createRoot(document.getElementById('app')!);

root.render(
  <>
    <h1>Clippy Editor (React)</h1>
    <hr />
    <h2>React editor example</h2>
    <ClippyEditor id="react-editor-1">
      <div slot="content">
        <h1>Kopniveau 1 in React editor</h1>
        <p>Dit is een voorbeeld van de Clippy Editor met een Lit React wrapper</p>
      </div>
    </ClippyEditor>
    <hr />
    <h2>React context, content and gutter example</h2>
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
        <ClippyGutter mode="list"></ClippyGutter>
      </ClippyContent>
      <ClippyValidationsList />
    </ClippyContext>
  </>,
);
