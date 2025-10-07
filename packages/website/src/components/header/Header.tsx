import { headerStyling } from './Header.css';

function Header() {
  return (
    <header className={headerStyling}>
      <h1>Rich-text editor met editoria11y (PoC)</h1>
      <p>
        In dit project wordt de Tiptap rich text editor gebruikt, een flexibele en uitbreidbare editor gebaseerd op
        ProseMirror. Editoria11y wordt ingezet voor live feedback aan de redacteur.
      </p>
    </header>
  );
}

export default Header;
