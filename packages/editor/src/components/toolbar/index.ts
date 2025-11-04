import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import ArrowBackUpIcon from '@tabler/icons/outline/arrow-back-up.svg?raw';
import ArrowForwardUpIcon from '@tabler/icons/outline/arrow-forward-up.svg?raw';
import './shortcuts-dialog';
import BoldIcon from '@tabler/icons/outline/bold.svg?raw';
import ItalicIcon from '@tabler/icons/outline/italic.svg?raw';
import KeyboardIcon from '@tabler/icons/outline/keyboard.svg?raw';
import './toolbar-button';
import './toolbar-format-select';
import UnderlineIcon from '@tabler/icons/outline/underline.svg?raw';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext, type ValidationsMap } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import toolbarStyles from './styles.ts';

const addAriaHidden = (svg: string) => svg.replace('<svg', '<svg aria-hidden="true"');

/**
 * @summary The toolbar for the Clippy rich text editor
 */
@customElement('clippy-toolbar')
export class Toolbar extends LitElement {
  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  #dialogRef: Ref<HTMLDialogElement> = createRef();

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  #toggleOpenShortcuts = () => {
    const { value } = this.#dialogRef;
    if (this.#dialogRef.value?.open) {
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

  static override readonly styles = [toolbarStyles, unsafeCSS(numberBadgeStyles)];

  override render() {
    const { size = 0 } = this.validationsContext || {};
    return html`
      <div class="clippy-toolbar__wrapper" aria-label="Werkbalk tekstbewerker">
        <clippy-format-select></clippy-format-select>
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
          label="Undo"
          ?disabled=${!(this.editor?.can().undo() ?? false)}
          @click=${() => this.editor?.commands.undo()}
        >
          ${unsafeSVG(addAriaHidden(ArrowBackUpIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Redo"
          ?disabled=${!(this.editor?.can().redo() ?? false)}
          @click=${() => this.editor?.commands.redo()}
          >${unsafeSVG(addAriaHidden(ArrowForwardUpIcon))}
        </clippy-toolbar-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-toolbar-button
          label="Keyboard shortcuts"
          .pressed=${this.#dialogRef.value?.open ?? false}
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
      <clippy-shortcuts .dialogRef=${this.#dialogRef}></clippy-shortcuts>
      <div class="clippy-screen-reader-text" aria-live=${size > 0 ? 'polite' : 'off'}>
        Totaal ${size} gevonden toegankelijkheidsfouten.
      </div>
    `;
  }
}
