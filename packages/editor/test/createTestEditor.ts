import { Editor } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { UndoRedo } from '@tiptap/extensions';
import { vi } from 'vitest';
import { EditorSettings } from '../src/types/settings';
import Validation from '../src/validators';

export function createTestEditor(
  content: string,
  callback: (resultMap: Map<string, unknown>) => void = vi.fn(),
  settings?: EditorSettings,
): Editor {
  return new Editor({
    content,
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
      Underline,
      UndoRedo,
      Validation.configure({
        settings,
        updateValidationsContext: callback,
      }),
    ],
  });
}
