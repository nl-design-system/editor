import clsx from 'clsx';
import { appStyling } from './app.css.ts';
import TiptapEditor from './components/editor/TiptapEditor.tsx';
import Header from './components/header/Header.tsx';
import { themeClass } from './theme.css.ts';

function App() {
  return (
    <div className={clsx(appStyling, themeClass)}>
      <Header />
      <main>
        <TiptapEditor />
      </main>
    </div>
  );
}

export default App;
