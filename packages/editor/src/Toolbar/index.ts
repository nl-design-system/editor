import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import BoldIcon from '@tabler/icons/outline/bold.svg?raw';
import ItalicIcon from '@tabler/icons/outline/italic.svg?raw';
import './ToolbarButton';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ComboBoxOption } from '../components/combo-box/types.ts';
import type { TextFormatChangeEvent } from '../types/formatChange.ts';
import { tiptapContext } from '../context/TiptapContext.ts';
import { CustomEvents } from '../events';
import toolbarStyles from './styles.ts';

const addAriaHidden = (svg: string) => svg.replace('<svg', '<svg aria-hidden="true"');

@customElement('clippy-toolbar')
export class Toolbar extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  #isFormatActive(name: string, attributes?: Record<'level', number>): boolean {
    return this.editor?.isActive(name, attributes) ?? false;
  }

  @state()
  private get options(): ComboBoxOption[] {
    return [
      {
        active: this.#isFormatActive('heading', { level: 1 }),
        label: 'Kopniveau 1',
        value: 'h1',
      },
      {
        active: this.#isFormatActive('heading', { level: 2 }),
        label: 'Kopniveau 2',
        value: 'h2',
      },
      {
        active: this.#isFormatActive('heading', { level: 3 }),
        label: 'Kopniveau 3',
        value: 'h3',
      },
      {
        active: this.#isFormatActive('paragraph'),
        label: 'Paragraaf',
        value: 'paragraph',
      },
    ];
  }

  static override readonly styles = [toolbarStyles];

  readonly #onUpdate = () => this.requestUpdate();

  readonly #handleTextFormatChange = (event: CustomEventInit<TextFormatChangeEvent>) => {
    const { value } = event.detail || {};
    if (!value || !this.editor) return;

    const chain = this.editor.chain().focus();

    const formatCommands: Record<'h1' | 'h2' | 'h3' | 'paragraph', () => typeof chain> = {
      h1: () => chain.toggleHeading({ level: 1 }),
      h2: () => chain.toggleHeading({ level: 2 }),
      h3: () => chain.toggleHeading({ level: 3 }),
      paragraph: () => chain.setParagraph(),
    };
    formatCommands[value]().run();
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener(CustomEvents.TEXT_FORMAT_CHANGE, this.#handleTextFormatChange);
    this.editor?.on('transaction', this.#onUpdate);
  }

  override disconnectedCallback() {
    this.editor?.off('transaction', this.#onUpdate);
    window.removeEventListener(CustomEvents.TEXT_FORMAT_CHANGE, this.#handleTextFormatChange);
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <div class="clippy-toolbar__wrapper" aria-label="Werkbalk tekstbewerker">
        <clippy-combo-box .options=${this.options}></clippy-combo-box>
        <clippy-toolbar-button
          label="Bold"
          .pressed=${this.editor?.isActive('bold') ?? false}
          @click=${() => this.editor?.chain().focus().toggleBold().run()}
        >
          ${unsafeSVG(addAriaHidden(BoldIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Italic"
          .pressed=${this.editor?.isActive('italic') ?? false}
          @click=${() => this.editor?.chain().focus().toggleItalic().run()}
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
