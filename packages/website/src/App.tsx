import clsx from 'clsx';
import { appStyling } from './app.css';
import TiptapEditor from './components/editor/TiptapEditor';
import Header from './components/header/Header';
import { themeClass } from './theme.css';

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
