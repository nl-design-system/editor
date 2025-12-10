import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import ArrowBackUpIcon from '@tabler/icons/outline/arrow-back-up.svg?raw';
import ArrowForwardUpIcon from '@tabler/icons/outline/arrow-forward-up.svg?raw';
import BoldIcon from '@tabler/icons/outline/bold.svg?raw';
import './shortcuts-dialog';
import ItalicIcon from '@tabler/icons/outline/italic.svg?raw';
import KeyboardIcon from '@tabler/icons/outline/keyboard.svg?raw';
import ListDetailsIcon from '@tabler/icons/outline/list-details.svg?raw';
import OrderedListIcon from '@tabler/icons/outline/list-numbers.svg?raw';
import BulletListIcon from '@tabler/icons/outline/list.svg?raw';
import TableIcon from '@tabler/icons/outline/table.svg?raw';
import './toolbar-button';
import './toolbar-format-select';
import UnderlineIcon from '@tabler/icons/outline/underline.svg?raw';
import { LitElement, html, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { TipTapController } from '@/controllers/TipTapController.ts';
import { CustomEvents } from '@/events';
import './toolbar-image-upload';
import './toolbar-link';
import toolbarStyles from './styles.ts';

const addAriaHidden = (svg: string) => svg.replace('<svg', '<svg aria-hidden="true"');

@customElement('clippy-toolbar')
export class Toolbar extends LitElement {
  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();
  readonly #focusNode: Ref<HTMLButtonElement> = createRef();

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  private readonly controller = new TipTapController(this);
  private get editor(): Editor | undefined {
    return this.controller.editor;
  }

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
        <clippy-toolbar-button
          label="Bold"
          .pressed=${this.editor?.isActive('bold') ?? false}
          @click=${() => this.editor?.chain().focus().toggleBold().run()}
          ${ref(this.#focusNode)}
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
          label="Ordered list"
          .pressed=${this.editor?.isActive('orderedList') ?? false}
          @click=${() => {
            this.editor?.chain().focus().toggleOrderedList().run();
          }}
        >
          ${unsafeSVG(addAriaHidden(OrderedListIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Bullet list"
          .pressed=${this.editor?.isActive('bulletList') ?? false}
          @click=${() => this.editor?.chain().focus().toggleBulletList().run()}
        >
          ${unsafeSVG(addAriaHidden(BulletListIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Definition list"
          .pressed=${this.editor?.isActive('definitionList') ?? false}
          @click=${() => this.editor?.chain().focus().insertDefinitionList().run()}
        >
          ${unsafeSVG(addAriaHidden(ListDetailsIcon))}
        </clippy-toolbar-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-toolbar-button
          label="Tabel invoegen"
          .pressed=${this.editor?.isActive('table') ?? false}
          @click=${() => this.editor?.chain().focus().insertTable({ cols: 3, rows: 2, withHeaderRow: true }).run()}
        >
          ${unsafeSVG(addAriaHidden(TableIcon))}
        </button>
        </clippy-toolbar-button>
        <div class="clippy-toolbar__divider"></div>
        <clippy-toolbar-link></clippy-toolbar-link>
        <clippy-toolbar-image-upload></clippy-toolbar-image-upload>
        <div class="clippy-toolbar__divider"></div>
        <clippy-toolbar-button
          label="Keyboard shortcuts"
          .pressed=${this.#dialogRef.value?.open ?? false}
          @click=${this.#toggleOpenShortcuts}
        >
          ${unsafeSVG(addAriaHidden(KeyboardIcon))}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          label="Toon toegankelijkheidsfouten"
          class="clippy-dialog-toggle"
          @click=${this.#toggleOpenValidationsDialog}
          aria-controls="dialog-content"
        >
          <span class="clippy-screen-reader-text">Toon toegankelijkheidsfouten</span>
          ${unsafeSVG(AccessibleIcon)}
          ${
            size > 0
              ? html`<data value=${size} class="nl-number-badge nl-number-badge--clippy">
                  <span hidden aria-hidden="true" class="nl-number-badge__visible-label">${size}</span>
                  <span class="nl-number-badge__hidden-label">${size} toegankelijkheidsmeldingen</span>
                </data>`
              : nothing
          }
        </clippy-toolbar-button>
      </div>
      <clippy-shortcuts .dialogRef=${this.#dialogRef}></clippy-shortcuts>
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
