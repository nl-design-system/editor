import type { Editor } from '@tiptap/core';
import AlignLeftIcon from '@tabler/icons/outline/align-left.svg?raw';
import AlignRightIcon from '@tabler/icons/outline/align-right.svg?raw';
import EditIcon from '@tabler/icons/outline/edit.svg?raw';
import { NodeSelection } from '@tiptap/pm/state';
import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { TipTapController } from '@/controllers/TipTapController.ts';
import { CustomEvents } from '@/events';
import bubbleMenuStyles from './styles.ts';

@customElement('clippy-bubble-menu')
export class ImageBubbleMenu extends LitElement {
  private readonly controller = new TipTapController(this);
  private get editor(): Editor | undefined {
    return this.controller.editor;
  }

  readonly #focusNode: Ref<HTMLButtonElement> = createRef();

  @state()
  visible = false;

  static override readonly styles = [bubbleMenuStyles];

  readonly #focusFirstElement = () => {
    const { value } = this.#focusNode;
    value?.shadowRoot?.querySelector('button')?.focus();
  };

  override firstUpdated(): void {
    globalThis.addEventListener(CustomEvents.FOCUS_BUBBLE_MENU, this.#focusFirstElement);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    globalThis.removeEventListener(CustomEvents.FOCUS_BUBBLE_MENU, this.#focusFirstElement);
  }

  #setAlignment(alignment: 'left' | 'center' | 'right'): void {
    if (!this.editor) return;

    this.editor.chain().focus().updateAttributes('image', { alignment }).run();
  }

  readonly #editImage = () => {
    const selection = (this.editor?.state.selection as NodeSelection) || null;
    if (!selection) return;
    const { alt, src } = selection.node.attrs;
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
        bubbles: true,
        composed: true,
        detail: {
          files: [
            {
              name: alt,
              type: '',
              url: src,
            },
          ],
          position: selection.$anchor.pos,
          replace: true,
        },
      }),
    );
  };

  override render() {
    if (!this.editor) return nothing;

    const attrs = this.editor.getAttributes('image');
    const isImageSelected = this.editor.isActive('image');

    if (!isImageSelected || !attrs) return nothing;

    return html`
      <div class="bubble-menu" role="toolbar" aria-label="Image alignment options">
        <clippy-toolbar-button
          aria-label="Align left"
          pressed="${attrs['alignment'] === 'left'}"
          @click="${() => this.#setAlignment('left')}"
          ${ref(this.#focusNode)}
        >
          ${unsafeSVG(AlignLeftIcon)}
        </clippy-toolbar-button>
        <clippy-toolbar-button
          aria-label="Align right"
          pressed="${attrs['alignment'] === 'right'}"
          @click="${() => this.#setAlignment('right')}"
        >
          ${unsafeSVG(AlignRightIcon)}
        </clippy-toolbar-button>
        <clippy-toolbar-button aria-label="Afbeelding bewerken" @click=${this.#editImage}>
          ${unsafeSVG(EditIcon)}
        </clippy-toolbar-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-bubble-menu': ImageBubbleMenu;
  }
}
