/**
 * Shared helpers for persisting the demo editor's content in `localStorage` so
 * that edits survive a page refresh and can be handed off to the preview page.
 *
 * Used by the home pages (`index.astro`, `en/index.astro`) to wire up saving,
 * restoring and resetting, and by `preview.astro` to seed its read-only content.
 */

/** localStorage key shared by the editor pages and the preview page. */
export const EDITOR_STORAGE_KEY = 'clippy-editor-content';

/** Minimal surface of the TipTap editor instance exposed on `<clippy-editor>`. */
interface EditorLike {
  getHTML(): string;
  commands: { setContent(content: string, options?: { emitUpdate?: boolean }): boolean };
  on(event: string, callback: () => void): void;
}

type EditorHost = HTMLElement & { editor?: EditorLike };

/**
 * Wait for `<clippy-editor>` to upgrade and create its TipTap editor instance.
 * Polls across animation frames because the instance is assigned asynchronously
 * in the component's `firstUpdated()`.
 */
async function getEditor(el: EditorHost): Promise<EditorLike | undefined> {
  await customElements.whenDefined('clippy-editor');
  for (let i = 0; i < 300 && !el.editor; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return el.editor;
}

interface PersistenceOptions {
  /** Id of the `<clippy-editor>` element. */
  editorId?: string;
  /** Id of the "reset to example content" button. */
  resetButtonId?: string;
  /** Id of the preview link/button. */
  previewLinkId?: string;
}

/**
 * Wire an editor page for persistence:
 * - restores previously saved content on load,
 * - saves to localStorage on every change,
 * - resets to the original example content on demand,
 * - flushes the latest content before navigating to the preview.
 */
export function setupEditorPersistence({
  editorId = 'clippy-editor-localhost',
  previewLinkId = 'clippy-preview-link',
  resetButtonId = 'clippy-reset',
}: PersistenceOptions = {}): void {
  const editorEl = document.getElementById(editorId) as EditorHost | null;
  if (!editorEl) return;

  const resetButton = document.getElementById(resetButtonId);
  const previewLink = document.getElementById(previewLinkId);
  const valueSlot = editorEl.querySelector('div[slot="value"]');

  // Snapshot the initial markup so "reset" can restore the example content.
  const exampleHtml = valueSlot?.innerHTML ?? '';

  getEditor(editorEl).then((editor) => {
    if (!editor) return;

    // Restore previously edited content without emitting an update (which would
    // immediately re-save identical content).
    const saved = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (saved) {
      editor.commands.setContent(saved, { emitUpdate: false });
    }

    // Persist on every content change.
    editor.on('update', () => {
      localStorage.setItem(EDITOR_STORAGE_KEY, editor.getHTML());
    });

    resetButton?.addEventListener('click', () => {
      editor.commands.setContent(exampleHtml);
      localStorage.setItem(EDITOR_STORAGE_KEY, editor.getHTML());
    });

    // Guarantee the latest content is stored before navigating to the preview.
    previewLink?.addEventListener('click', () => {
      localStorage.setItem(EDITOR_STORAGE_KEY, editor.getHTML());
    });
  });
}
