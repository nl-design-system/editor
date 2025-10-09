import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tiptapContext } from './context/TiptapContext.ts';

@customElement('nlds-editor-content')
export class EditorContent extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  protected override createRenderRoot() {
    return this;
  }

  override render() {
    return html` <div class="editor"></div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nlds-editor-content': EditorContent;
  }
}
