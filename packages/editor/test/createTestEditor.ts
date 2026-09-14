import { Editor } from '@tiptap/core';
import { vi } from 'vitest';
import type { EditorExtensionOptions } from '@/extensions';
import { editorExtensions } from '@/extensions';

/** Stable reference, so every caller that omits the options gets the same object. */
const DEFAULT_OPTIONS: EditorExtensionOptions = { getValidations: () => undefined };

export async function createTestEditor(
  content: string,
  callback: (resultMap: Map<Range, unknown>) => void = vi.fn(),
  options: EditorExtensionOptions = DEFAULT_OPTIONS,
): Promise<Editor> {
  const editor = new Editor({
    content,
    extensions: editorExtensions(options, callback),
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
