import type { Editor } from '@tiptap/core';
import type { EditorTestWrapper } from './editor-wrapper.ts';
import './editor-wrapper.ts';

export interface EditorTestSetup {
  container: HTMLElement;
  wrapper: EditorTestWrapper;
  setEditor: (editor: Editor) => Promise<void>;
}

/**
 * Sets up a test environment with editor context provider.
 *
 * @param innerHTML - HTML content to render inside the wrapper
 * @returns Test setup object with container, wrapper, and helper methods
 */
export function setupTestEditor(innerHTML: string): EditorTestSetup {
  const container = document.createElement('div');
  document.body.appendChild(container);

  container.innerHTML = `<editor-test-wrapper>${innerHTML}</editor-test-wrapper>`;
  const wrapper = container.querySelector<EditorTestWrapper>('editor-test-wrapper')!;

  const setEditor = async (editor: Editor): Promise<void> => {
    wrapper.editor = editor;
    await wrapper.updateComplete;
  };

  return { container, setEditor, wrapper };
}

export function cleanupTestEditor(container: HTMLElement): void {
  document.body.removeChild(container);
}
