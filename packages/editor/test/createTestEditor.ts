import { Editor } from '@tiptap/core';
import { vi } from 'vitest';
import { editorExtensions } from '../src/extensions';
import { EditorSettings } from '../src/types/settings';

const DEFAULT_EDITOR_SETTINGS: EditorSettings = { topHeadingLevel: 1 };

export async function createTestEditor(
  content: string,
  callback: (resultMap: Map<string, unknown>) => void = vi.fn(),
  settings: EditorSettings = DEFAULT_EDITOR_SETTINGS,
): Promise<Editor> {
  const editor = new Editor({
    content,
    extensions: editorExtensions(settings, callback),
  });

  if (editor.isInitialized) return editor;

  await new Promise<void>((resolve) => {
    const onCreate = () => {
      editor.off('create', onCreate);
      resolve();
    };
    editor.on('create', onCreate);
  });

  return editor;
}
