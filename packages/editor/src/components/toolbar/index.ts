import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import BoldIcon from '@tabler/icons/outline/bold.svg?raw';
import ItalicIcon from '@tabler/icons/outline/italic.svg?raw';
import './shortcuts-dialog';
import KeyboardIcon from '@tabler/icons/outline/keyboard.svg?raw';
import './toolbar-button';
import UnderlineIcon from '@tabler/icons/outline/underline.svg?raw';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { TextFormatChangeEvent } from '@/types/formatChange.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext, type ValidationsMap } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import type { ComboBoxOption } from '../combo-box/types.ts';
import toolbarStyles from './styles.ts';

const addAriaHidden = (svg: string) => svg.replace('<svg', '<svg aria-hidden="true"');

@customElement('clippy-toolbar')
export class Toolbar extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  private dialogRef: Ref<HTMLDialogElement> = createRef();

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  #toggleOpenShortcuts = () => {
    const { value } = this.dialogRef;
    if (this.dialogRef.value?.open) {
      value?.close();
    } else {
      value?.showModal();
    }
  };

  #toggleOpenValidationsDialog = (key: string) => {
    window.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, {
        bubbles: true,
        composed: true,
        detail: { key },
      }),
    );
  };

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
        active: this.#isFormatActive('heading', { level: 4 }),
        label: 'Kopniveau 4',
        value: 'h3',
      },
      {
        active: this.#isFormatActive('heading', { level: 5 }),
        label: 'Kopniveau 5',
        value: 'h3',
      },
      {
        active: this.#isFormatActive('heading', { level: 6 }),
        label: 'Kopniveau 6',
        value: 'h3',
      },
      {
        active: this.#isFormatActive('paragraph'),
        label: 'Paragraaf',
        value: 'paragraph',
      },
    ];
  }

  static override readonly styles = [toolbarStyles, unsafeCSS(numberBadgeStyles)];

  readonly #onUpdate = () => this.requestUpdate();

  readonly #handleTextFormatChange = (event: CustomEventInit<TextFormatChangeEvent>) => {
    const { value } = event.detail || {};
    if (!value || !this.editor) return;

    const chain = this.editor.chain().focus();

    const formatCommands: Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'paragraph', () => typeof chain> = {
      h1: () => chain.toggleHeading({ level: 1 }),
      h2: () => chain.toggleHeading({ level: 2 }),
      h3: () => chain.toggleHeading({ level: 3 }),
      h4: () => chain.toggleHeading({ level: 4 }),
      h5: () => chain.toggleHeading({ level: 5 }),
      h6: () => chain.toggleHeading({ level: 6 }),
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

  #onSelectionChange = (value: string) => {
    window.dispatchEvent(new CustomEvent(CustomEvents.TEXT_FORMAT_CHANGE, { detail: { value: value } }));
  };

  override render() {
    const { size = 0 } = this.validationsContext || {};
    return html`
      <div class="clippy-toolbar__wrapper" aria-label="Werkbalk tekstbewerker">
        <clippy-combo-box .onSelect=${this.#onSelectionChange} .options=${this.options}></clippy-combo-box>
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
        <clippy-toolbar-button
          label="Underline"
          .pressed=${this.editor?.isActive('underline') ?? false}
          @click=${() => this.editor?.chain().focus().toggleUnderline().run()}
        >
          ${unsafeSVG(addAriaHidden(UnderlineIcon))}
        </clippy-toolbar-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-toolbar-button
          label="Keyboard shortcuts"
          .pressed=${this.dialogRef.value?.open ?? false}
          @click=${this.#toggleOpenShortcuts}
        >
          ${unsafeSVG(addAriaHidden(KeyboardIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          class="clippy-dialog-toggle"
          @click=${this.#toggleOpenValidationsDialog}
          aria-controls="dialog-content"
        >
          <span class="clippy-screen-reader-text">Toon toegankelijkheidsfouten</span>
          ${unsafeSVG(AccessibleIcon)}
          ${size > 0
            ? html`<data value=${size} class="nl-number-badge nl-number-badge--clippy">
                <span hidden aria-hidden="true" class="nl-number-badge__visible-label">${size}</span>
                <span class="nl-number-badge__hidden-label">${size} toegankelijkheidsmeldingen</span>
              </data>`
            : null}
        </clippy-toolbar-button>
      </div>
      <clippy-shortcuts .dialogRef=${this.dialogRef}></clippy-shortcuts>
      <div class="clippy-screen-reader-text" aria-live=${size > 0 ? 'polite' : 'off'}>
        Totaal ${size} gevonden toegankelijkheidsfouten.
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-toolbar': Toolbar;
  }
}
