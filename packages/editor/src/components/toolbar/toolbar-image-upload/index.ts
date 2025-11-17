import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import PhotoIcon from '@tabler/icons/outline/photo.svg?raw';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ImageUpload } from '@/types/image.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { CustomEvents } from '@/events';
import imageUploadDialogStyles from './styles.ts';

@customElement('clippy-toolbar-image-upload')
export class ToolbarImageUpload extends LitElement {
  static override readonly styles = [imageUploadDialogStyles];

  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();
  readonly #inputRef: Ref<HTMLInputElement> = createRef();

  @state()
  files: ImageUpload[] = [];
  @state()
  position = 0;
  @state()
  replace = false;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: Editor;

  readonly #toggleImageUploadDialog = (
    event: CustomEventInit<{ files: ImageUpload[]; position: number; replace: boolean }>,
  ) => {
    if (event.detail?.files) {
      this.#dialogRef.value?.showModal();
      this.files = event.detail.files;
      this.position = event.detail.position;
      this.replace = event.detail.replace || false;
    } else {
      this.#inputRef.value?.click();
    }
  };

  readonly #handleOnChange = (event: Event) => {
    const { files } = event.target as HTMLInputElement;
    this.position = this.editor?.state.selection.$anchor.pos || 0;
    if (files?.length) {
      this.files = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      }));
      this.#dialogRef.value?.showModal();
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.OPEN_IMAGE_DIALOG, this.#toggleImageUploadDialog);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.OPEN_IMAGE_DIALOG, this.#toggleImageUploadDialog);
    super.disconnectedCallback();
  }

  readonly #insertImages = () => {
    this.#dialogRef.value?.close();
    // If replacing, delete the existing node first
    const chain = this.editor?.chain();
    if (chain && this.replace) {
      chain.deleteSelection();
    }
    for (const file of this.files) {
      chain
        ?.insertContentAt(this.position, {
          attrs: {
            alt: file.name,
            src: file.url,
          },
          type: 'image',
        })
        .focus()
        .run();
    }
    this.files = [];
  };

  readonly #updateAltText = (index: number) => (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.files[index].name = input.value;
  };

  override render() {
    return html`
      <clippy-toolbar-button
        class="clippy-toolbar-image-upload--button"
        @click=${this.#toggleImageUploadDialog}
        aria-controls="clippy-image-upload-dialog"
      >
        ${unsafeSVG(PhotoIcon)}
        <input
          ${ref(this.#inputRef)}
          type="file"
          id="clippy-image-upload"
          style="display:none"
          accept="image/*"
          multiple
          @change=${this.#handleOnChange}
        />
      </clippy-toolbar-button>
      <dialog id="clippy-image-upload-dialog" class="clippy-toolbar-image-upload--dialog" ${ref(this.#dialogRef)}>
        ${map(
          this.files,
          (file, index) =>
            html`<li class="clippy-toolbar-image-upload--li">
              <img src="${file.url}" alt="${file.name}" />
              <div>
                <label
                  >Alt text:<input type="text" .value="${file.name}" @change=${this.#updateAltText(index)}
                /></label>
              </div>
            </li>`,
        )}
        <button @click=${this.#insertImages}>Invoegen</button>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-toolbar-image-upload': ToolbarImageUpload;
  }
}
