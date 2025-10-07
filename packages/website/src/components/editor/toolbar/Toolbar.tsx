import { useCurrentEditor, useEditorState } from '@tiptap/react';
import { toolbarStyling } from './ToolbarButton.css';
import ToolbarButton from './ToolbarButton.tsx';

function Toolbar() {
  const { editor } = useCurrentEditor();

  const editorState = useEditorState({
    editor,
    // the selector function is used to select the state you want to react to
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        isAlert: editor.isActive('alert'),
        isHeading1: editor.isActive('heading', { level: 1 }),
        isHeading2: editor.isActive('heading', { level: 2 }),
        isHeading3: editor.isActive('heading', { level: 3 }),
        isParagraph: editor.isActive('paragraph'),
      };
    },
  });

  return (
    <div className={toolbarStyling} aria-label="Werkbalk tekstbewerker">
      <ToolbarButton
        aria-label="Heading level 1"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        pressed={!!editorState?.isHeading1}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        aria-label="Heading level 2"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        pressed={!!editorState?.isHeading2}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        aria-label="Heading level 3"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        pressed={!!editorState?.isHeading3}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        aria-label="Paragraph"
        onClick={() => editor?.chain().focus().setParagraph()}
        pressed={!!editorState?.isParagraph}
      >
        P
      </ToolbarButton>
      <ToolbarButton
        aria-label="Alert"
        onClick={() => editor?.commands.setAlert('info')}
        pressed={!!editorState?.isAlert}
      >
        !
      </ToolbarButton>
    </div>
  );
}

export default Toolbar;
