import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tiptapContext } from '../context/TiptapContext.ts';
import toolbarStyles from './toolbar.css.ts';
import './ToolbarButton.ts';

@customElement('nlds-editor-toolbar')
export class EditorToolbar extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  static override styles = [toolbarStyles];

  private _onUpdate = () => this.requestUpdate();

  override connectedCallback() {
    super.connectedCallback();
    this.editor?.on('selectionUpdate', this._onUpdate);
  }

  override disconnectedCallback() {
    this.editor?.off('selectionUpdate', this._onUpdate);
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <div class="nlds-editor-toolbar__wrapper" aria-label="Werkbalk tekstbewerker">
        <nlds-editor-toolbar-button
          label="Heading level 1"
          .pressed=${this.editor?.isActive('heading', { level: 1 }) ?? false}
          .onClick=${() => this.editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </nlds-editor-toolbar-button>
        <nlds-editor-toolbar-button
          label="Heading level 2"
          .pressed=${this.editor?.isActive('heading', { level: 2 }) ?? false}
          @click=${() => this.editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </nlds-editor-toolbar-button>
        <nlds-editor-toolbar-button
          label="Heading level 3"
          .pressed=${this.editor?.isActive('heading', { level: 3 }) ?? false}
          @click=${() => this.editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </nlds-editor-toolbar-button>
        <nlds-editor-toolbar-button
          label="Paragraph"
          .pressed=${this.editor?.isActive('paragraph') ?? false}
          @click=${() => this.editor?.chain().focus().setParagraph().run()}
        >
          P
        </nlds-editor-toolbar-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nlds-editor-toolbar': EditorToolbar;
  }
}
