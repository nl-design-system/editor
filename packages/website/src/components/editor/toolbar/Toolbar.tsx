import { useCurrentEditor } from '@tiptap/react';
import clsx from 'clsx';
import { toolbarButtonStyling, toolbarStyling } from './ToolbarButton.css.ts';

function Toolbar() {
  const { editor } = useCurrentEditor();

  return (
    <div className={toolbarStyling} role="toolbar" aria-label="Werkbalk tekstbewerker">
      <button
        aria-label="Heading level 1"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        className={clsx(editor?.isActive('heading', { level: 1 }) ? 'is-active' : '', toolbarButtonStyling)}
      >
        H1
      </button>
      <button
        aria-label="Heading level 2"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={clsx(editor?.isActive('heading', { level: 2 }) ? 'is-active' : '', toolbarButtonStyling)}
      >
        H2
      </button>
      <button
        aria-label="Heading level 3"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        className={clsx(editor?.isActive('heading', { level: 3 }) ? 'is-active' : '', toolbarButtonStyling)}
      >
        H3
      </button>
      <button
        aria-label="Paragraph"
        onClick={() => editor?.commands.setParagraph()}
        className={clsx(editor?.isActive('paragraph') ? 'is-active' : '', toolbarButtonStyling)}
      >
        P
      </button>
      <button
        aria-label="Alert"
        onClick={() => editor?.commands.setAlert('info')}
        className={clsx(editor?.isActive('alert') ? 'is-active' : '', toolbarButtonStyling)}
      >
        !
      </button>
    </div>
  );
}

export default Toolbar;
