import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import { Editor } from '@tiptap/core';
import { vi } from 'vitest';
import { editorExtensions } from '@/extensions';
import { debouncedValidate, runValidation } from '@/validations';

export async function createTestEditor(
  content: string,
  callback: (resultMap: Map<Range, unknown>) => void = vi.fn(),
  validations?: readonly Validation[],
  readonly = false,
): Promise<Editor> {
  const editor = new Editor({
    content,
    extensions: editorExtensions({
      readonly,
      scheduleValidation: (dom) => debouncedValidate(dom, validations, callback),
      validate: (dom) => runValidation(dom, validations, callback),
    }),
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
