import type { Editor } from '@tiptap/core';
import { ContextProvider, Context } from '@lit/context';
import { html, LitElement, type TemplateResult } from 'lit';
import { tiptapContext } from '../src/context/tiptapContext';
import { createTestEditor } from './createTestEditor';

export class EditorTestWrapper extends LitElement {
  static override readonly properties = {
    editor: { attribute: false },
  } as const;

  editor?: Editor;

  private readonly provider: ContextProvider<Context<unknown, Editor | undefined>, this>;

  constructor() {
    super();
    this.provider = new ContextProvider(this, tiptapContext, undefined);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Create the editor asynchronously after the element is connected
    this.setupEditor();
  }

  async setupEditor(): Promise<void> {
    const editor = await createTestEditor('<p>Test</p>');
    this.editor = editor;
    this.provider.value = editor;
  }

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

customElements.define('editor-test-wrapper', EditorTestWrapper);

declare global {
  interface HTMLElementTagNameMap {
    'editor-test-wrapper': EditorTestWrapper;
  }
}
