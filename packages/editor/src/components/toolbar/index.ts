import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import ArrowBackUpIcon from '@tabler/icons/outline/arrow-back-up.svg?raw';
import ArrowForwardUpIcon from '@tabler/icons/outline/arrow-forward-up.svg?raw';
import BoldIcon from '@tabler/icons/outline/bold.svg?raw';
import CodeIcon from '@tabler/icons/outline/code.svg?raw';
import './shortcuts-dialog';
import ItalicIcon from '@tabler/icons/outline/italic.svg?raw';
import KeyboardIcon from '@tabler/icons/outline/keyboard.svg?raw';
import ListDetailsIcon from '@tabler/icons/outline/list-details.svg?raw';
import OrderedListIcon from '@tabler/icons/outline/list-numbers.svg?raw';
import BulletListIcon from '@tabler/icons/outline/list.svg?raw';
import TableIcon from '@tabler/icons/outline/table.svg?raw';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import './toolbar-format-select';
import UnderlineIcon from '@tabler/icons/outline/underline.svg?raw';
import { LitElement, html, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { CustomEvents } from '@/events';
import './toolbar-image-upload';
import './toolbar-link';
import toolbarStyles from './styles.ts';

@customElement('clippy-toolbar')
export class Toolbar extends LitElement {
  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();
  readonly #focusNode: Ref<HTMLButtonElement> = createRef();

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  @editor()
  private readonly editor: Editor | undefined;

  readonly #toggleOpenShortcuts = () => {
    const { value } = this.#dialogRef;
    if (this.#dialogRef.value?.open) {
      value?.close();
    } else {
      value?.showModal();
    }
  };

  readonly #onToolbarFocus = () => {
    const { value } = this.#focusNode;
    value?.shadowRoot?.querySelector('button')?.focus();
  };

  readonly #toggleOpenValidationsDialog = () => {
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, {
        bubbles: true,
        composed: true,
      }),
    );
  };

  override connectedCallback() {
    globalThis.addEventListener(CustomEvents.FOCUS_TOOLBAR, this.#onToolbarFocus);
    super.connectedCallback();
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.FOCUS_TOOLBAR, this.#onToolbarFocus);
    super.disconnectedCallback();
  }

  static override readonly styles = [toolbarStyles, unsafeCSS(numberBadgeStyles)];

  override render() {
    const { size = 0 } = this.validationsContext || {};
    return html`
      <div class="clippy-toolbar__wrapper" aria-label="Werkbalk tekstbewerker">
        <clippy-format-select></clippy-format-select>
        <clippy-button
          toggle
          .pressed=${this.editor?.isActive('bold') ?? false}
          @click=${() => this.editor?.chain().focus().toggleBold().run()}
          ${ref(this.#focusNode)}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(BoldIcon)}</clippy-icon>
          Vet
        </clippy-button>
        <clippy-button
          toggle
          .pressed=${this.editor?.isActive('italic') ?? false}
          @click=${() => this.editor?.chain().focus().toggleItalic().run()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(ItalicIcon)}</clippy-icon>
          Cursief
        </clippy-button>
        <clippy-button
          toggle
          .pressed=${this.editor?.isActive('underline') ?? false}
          @click=${() => this.editor?.chain().focus().toggleUnderline().run()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(UnderlineIcon)}</clippy-icon>
          Onderstrepen
        </clippy-button>
        <clippy-button
          toggle
          .pressed=${this.editor?.isActive('code') ?? false}
          @click=${() => this.editor?.chain().focus().toggleCode().run()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(CodeIcon)}</clippy-icon>
          Code
        </clippy-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-button
          ?disabled=${!(this.editor?.can().undo() ?? false)}
          @click=${() => this.editor?.commands.undo()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(ArrowBackUpIcon)}</clippy-icon>
          Ongedaan maken
        </clippy-button>
        <clippy-button
          ?disabled=${!(this.editor?.can().redo() ?? false)}
          @click=${() => this.editor?.commands.redo()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(ArrowForwardUpIcon)}</clippy-icon>
          Opnieuw
        </clippy-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-button
          .pressed=${this.editor?.isActive('orderedList') ?? false}
          @click=${() => {
            this.editor?.chain().focus().toggleOrderedList().run();
          }}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(OrderedListIcon)}</clippy-icon>
          Genummerde lijst
        </clippy-button>
        <clippy-button
          toggle
          .pressed=${this.editor?.isActive('bulletList') ?? false}
          @click=${() => this.editor?.chain().focus().toggleBulletList().run()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(BulletListIcon)}</clippy-icon>
          Geordende lijst
        </clippy-button>
        <clippy-button
          toggle
          .pressed=${this.editor?.isActive('definitionList') ?? false}
          @click=${() => this.editor?.chain().focus().insertDefinitionList().run()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(ListDetailsIcon)}</clippy-icon>
          Definitielijst
        </clippy-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-button
          .pressed=${this.editor?.isActive('table') ?? false}
          @click=${() => this.editor?.chain().focus().insertTable({ cols: 3, rows: 2, withHeaderRow: true }).run()}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(TableIcon)}</clippy-icon>
          Tabel invoegen
        </clippy-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-toolbar-link></clippy-toolbar-link>
        <clippy-toolbar-image-upload></clippy-toolbar-image-upload>
        <div class="clippy-toolbar__divider"></div>
        <clippy-button
          .pressed=${this.#dialogRef.value?.open ?? false}
          @click=${this.#toggleOpenShortcuts}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(KeyboardIcon)}</clippy-icon>
          Sneltoetsen
        </clippy-button>
        <span style="position: relative;">
          <clippy-button
            @click=${this.#toggleOpenValidationsDialog}
            aria-controls="dialog-content"
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(AccessibleIcon)}</clippy-icon>
            Toon toegankelijkheidsmeldingen
          </clippy-button>
          ${size > 0
            ? html`<data value=${size} class="nl-number-badge nl-number-badge--clippy">
                <span hidden aria-hidden="true" class="nl-number-badge__visible-label">${size}</span>
                <span class="nl-number-badge__hidden-label">${size} toegankelijkheidsmeldingen</span>
              </data>`
            : nothing}
        </span>
      </div>
      <clippy-shortcuts .dialogRef=${this.#dialogRef}></clippy-shortcuts>
      <div class="clippy-screen-reader-text" aria-live=${size > 0 ? 'polite' : 'off'}>
        Totaal ${size} toegankelijkheidsmeldingen gevonden.
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-toolbar': Toolbar;
  }
}
