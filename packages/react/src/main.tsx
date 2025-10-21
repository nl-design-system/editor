import 'react';
import { createRoot } from 'react-dom/client';
import { ClippyEditor } from './Editor';

const root = createRoot(document.getElementById('app')!);

root.render(
  <>
    <h1>Clippy Editor (React)</h1>
    <ClippyEditor />
  </>,
);
