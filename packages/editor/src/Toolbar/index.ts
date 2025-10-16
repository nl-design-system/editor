import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import BoldIcon from '@tabler/icons/outline/bold.svg?raw';
import Heading1Icon from '@tabler/icons/outline/h-1.svg?raw';
import Heading2Icon from '@tabler/icons/outline/h-2.svg?raw';
import Heading3Icon from '@tabler/icons/outline/h-3.svg?raw';
import ItalicIcon from '@tabler/icons/outline/italic.svg?raw';
import PilcrowIcon from '@tabler/icons/outline/pilcrow.svg?raw';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { tiptapContext } from '../context/TiptapContext.ts';
import './ToolbarButton';
import toolbarStyles from './styles.ts';

const addAriaHidden = (svg: string) => svg.replace('<svg', '<svg aria-hidden="true"');

@customElement('clippy-toolbar')
export class Toolbar extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  static override readonly styles = [toolbarStyles];

  readonly #onUpdate = () => this.requestUpdate();

  override connectedCallback() {
    super.connectedCallback();
    this.editor?.on('transaction', this.#onUpdate);
  }

  override disconnectedCallback() {
    this.editor?.off('transaction', this.#onUpdate);
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <div class="clippy-toolbar__wrapper" aria-label="Werkbalk tekstbewerker">
        <clippy-toolbar-button
          label="Heading level 1"
          .pressed=${this.editor?.isActive('heading', { level: 1 }) ?? false}
          .onClick=${() => this.editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          ${unsafeSVG(addAriaHidden(Heading1Icon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Heading level 2"
          .pressed=${this.editor?.isActive('heading', { level: 2 }) ?? false}
          @click=${() => this.editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          ${unsafeSVG(addAriaHidden(Heading2Icon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Heading level 3"
          .pressed=${this.editor?.isActive('heading', { level: 3 }) ?? false}
          @click=${() => this.editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          ${unsafeSVG(addAriaHidden(Heading3Icon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Paragraph"
          .pressed=${this.editor?.isActive('paragraph') ?? false}
          @click=${() => this.editor?.chain().focus().setParagraph().run()}
        >
          ${unsafeSVG(addAriaHidden(PilcrowIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Bold"
          .pressed=${this.editor?.isActive('bold') ?? false}
          @click=${() => this.editor?.chain().focus().setBold().run()}
        >
          ${unsafeSVG(addAriaHidden(BoldIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Italic"
          .pressed=${this.editor?.isActive('italic') ?? false}
          @click=${() => this.editor?.chain().focus().setItalic().run()}
        >
          ${unsafeSVG(addAriaHidden(ItalicIcon))}
        </clippy-toolbar-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-toolbar': Toolbar;
  }
}
