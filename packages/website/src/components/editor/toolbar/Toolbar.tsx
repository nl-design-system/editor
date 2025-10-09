import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tiptapContext } from '../context/TiptapContext.ts';
import ToolbarStyles from './Toolbar.css.ts';

@customElement('nlds-editor-toolbar')
export class EditorToolbar extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  static override styles = [ToolbarStyles];

  override render() {
    console.log(this.editor);
    return html`
      <div aria-label="Werkbalk tekstbewerker">
        <button
          aria-label="Heading level 1"
          @click=${() => this.editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          .aria-pressed=${this.editor?.isActive('heading', { level: 1 }) ?? false}
        >
          H1
        </button>
        <button
          aria-label="Heading level 2"
          @click=${() => this.editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          aria-label="Heading level 3"
          @click=${() => this.editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button aria-label="Paragraph" @click=${() => this.editor?.chain().focus().setParagraph().run()}>P</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nlds-editor-toolbar': EditorToolbar;
  }
}
