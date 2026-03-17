import type { Editor } from '@tiptap/core';
import { localized, msg } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import { ClippyModal } from '@nl-design-system-community/clippy-components/clippy-modal';
import FolderIcon from '@tabler/icons/outline/folder.svg?raw';
import LockOpenIcon from '@tabler/icons/outline/lock-open.svg?raw';
import LockIcon from '@tabler/icons/outline/lock.svg?raw';
import PhotoIcon from '@tabler/icons/outline/photo.svg?raw';
import formFieldStyles from '@utrecht/form-field-css/dist/index.css?inline';
import formLabelStyles from '@utrecht/form-label-css/dist/index.css?inline';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import textBoxStyles from '@utrecht/textbox-css/dist/index.css?inline';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { query, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ImageUpload } from '@/types/image.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { CustomEvents } from '@/events';
import { imageDialogStyles } from './styles.ts';

const tag = 'clippy-toolbar-image-upload';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ToolbarImageUpload;
  }
}

@localized()
@safeCustomElement(tag)
export class ToolbarImageUpload extends LitElement {
  static override readonly styles = [
    imageDialogStyles,
    unsafeCSS(buttonCss),
    unsafeCSS(formFieldStyles),
    unsafeCSS(formLabelStyles),
    unsafeCSS(textBoxStyles),
  ];

  @query('clippy-modal')
  private readonly modalDialog!: ClippyModal;

  readonly #fileInputRef: Ref<HTMLInputElement> = createRef();
  readonly #srcRef: Ref<HTMLInputElement> = createRef();

  @state() private src = '';
  @state() private alt = '';
  @state() private width = '';
  @state() private height = '';
  @state() private constrainProportions = true;

  #aspectRatio: number | null = null;
  #pendingFiles: ImageUpload[] = [];
  #insertPosition = 0;
  #replaceExisting = false;

  @editor()
  private readonly editor: Editor | undefined;

  readonly #openForEdit = () => {
    if (!this.editor) return;

    if (this.editor.isActive('image')) {
      const attrs = this.editor.getAttributes('image');
      this.src = attrs['src'] ?? '';
      this.alt = attrs['alt'] ?? '';
      this.width = attrs['width'] ? String(attrs['width']) : '';
      this.height = attrs['height'] ? String(attrs['height']) : '';
      this.#extractAspectRatio(this.src);
    } else {
      this.#resetFields();
    }

    this.modalDialog.open();
  };

  readonly #onOpenImageDialog = (
    event: CustomEventInit<{ files: ImageUpload[]; position: number; replace: boolean }>,
  ) => {
    const { files, position, replace } = event.detail ?? {};

    if (!files?.length) {
      this.#fileInputRef.value?.click();
      return;
    }

    this.#pendingFiles = files;
    this.#insertPosition = position ?? this.editor?.state.selection.$anchor.pos ?? 0;
    this.#replaceExisting = replace ?? false;

    if (files.length === 1) {
      this.#prefillFromFile(files[0]);
      this.modalDialog.open();
    } else {
      this.#commitPendingFiles();
    }
  };

  readonly #onFileInputChange = (event: Event) => {
    const { files } = event.target as HTMLInputElement;
    if (!files?.length) return;

    this.#pendingFiles = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    this.#insertPosition = this.editor?.state.selection.$anchor.pos ?? 0;
    this.#replaceExisting = false;

    if (this.#pendingFiles.length === 1) {
      this.#prefillFromFile(this.#pendingFiles[0]);
      this.modalDialog.open();
    } else {
      this.#commitPendingFiles();
    }

    // Reset so the same file can be re-selected
    if (this.#fileInputRef.value) this.#fileInputRef.value.value = '';
  };

  #resetFields() {
    this.src = '';
    this.alt = '';
    this.width = '';
    this.height = '';
    this.#aspectRatio = null;
  }

  #prefillFromFile(file: ImageUpload) {
    this.src = file.url;
    this.alt = file.name;
    this.width = '';
    this.height = '';
    this.#extractAspectRatio(file.url);
  }

  #extractAspectRatio(src: string) {
    this.#aspectRatio = null;
    if (!src) return;
    const img = new globalThis.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        this.#aspectRatio = img.naturalWidth / img.naturalHeight;
      }
    };
    img.src = src;
  }

  readonly #handleWidthInput = (event: Event) => {
    this.width = (event.target as HTMLInputElement).value;
    if (this.constrainProportions && this.#aspectRatio && this.width) {
      const w = Number.parseFloat(this.width);
      if (!Number.isNaN(w)) this.height = String(Math.round(w / this.#aspectRatio));
    }
  };

  readonly #handleHeightInput = (event: Event) => {
    this.height = (event.target as HTMLInputElement).value;
    if (this.constrainProportions && this.#aspectRatio && this.height) {
      const h = Number.parseFloat(this.height);
      if (!Number.isNaN(h)) this.width = String(Math.round(h * this.#aspectRatio));
    }
  };

  // ── Commit / remove ──────────────────────────────────────────────────────────

  readonly #applyImage = () => {
    const src = this.#srcRef.value?.value.trim() ?? this.src.trim();
    if (!src) {
      this.modalDialog.close();
      return;
    }

    const attrs: Record<string, string> = { src };
    if (this.alt) attrs['alt'] = this.alt;
    if (this.width) attrs['width'] = this.width;
    if (this.height) attrs['height'] = this.height;

    try {
      if (this.editor?.isActive('image')) {
        // Editing an existing image node
        this.editor.chain().focus().updateAttributes('image', attrs).run();
      } else if (this.#pendingFiles.length > 0) {
        // Inserting from a file upload / drag-drop
        const chain = this.editor?.chain();
        if (this.#replaceExisting) chain?.deleteSelection();
        chain?.insertContentAt(this.#insertPosition, { attrs, type: 'image' }).focus().run();
        this.#pendingFiles = [];
      } else {
        // Inserting a URL image
        this.editor
          ?.chain()
          .focus()
          .setImage({ alt: this.alt || undefined, src })
          .run();
      }
    } catch (error) {
      console.error(error);
    }

    this.modalDialog.close();
  };

  readonly #removeImage = () => {
    this.editor?.chain().focus().deleteSelection().run();
    this.modalDialog.close();
  };

  #commitPendingFiles() {
    const chain = this.editor?.chain();
    if (this.#replaceExisting) chain?.deleteSelection();
    for (const file of this.#pendingFiles) {
      chain
        ?.insertContentAt(this.#insertPosition, {
          attrs: { alt: file.name, src: file.url },
          type: 'image',
        })
        .focus()
        .run();
    }
    this.#pendingFiles = [];
  }

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.OPEN_IMAGE_DIALOG, this.#onOpenImageDialog);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.OPEN_IMAGE_DIALOG, this.#onOpenImageDialog);
    super.disconnectedCallback();
  }

  override render() {
    const isEditing = this.editor?.isActive('image') ?? false;

    return html`
      <clippy-button
        @click=${this.#openForEdit}
        aria-controls="clippy-image-dialog"
        .pressed=${isEditing}
        icon-only
        toggle
        size="small"
        purpose="secondary"
      >
        <clippy-icon slot="iconStart">${unsafeSVG(PhotoIcon)}</clippy-icon>
        ${msg('Image')}
      </clippy-button>

      <input
        ${ref(this.#fileInputRef)}
        type="file"
        data-testid="clippy-image-upload"
        style="display:none"
        accept="image/*"
        multiple
        @change=${this.#onFileInputChange}
      />

      <clippy-modal
        .title=${isEditing ? msg('Edit Image') : msg('Insert Image')}
        actions="none"
        data-testid="clippy-image-dialog"
      >
        <div class="utrecht-document">
          <form
            @submit=${(e: Event) => {
              e.preventDefault();
              this.#applyImage();
            }}
          >
            ${this.src
              ? html`
                  <div class="toolbar-image__preview">
                    <img src=${this.src} alt=${this.alt} class="toolbar-image__preview-img" />
                  </div>
                `
              : nothing}

            <div class="utrecht-form-field utrecht-form-field--text">
              <div class="utrecht-form-field__label">
                <label class="utrecht-form-label" for="clippy-image-src">${msg('Source')}</label>
              </div>
              <div class="utrecht-form-field__input toolbar-image__source-row">
                <input
                  ${ref(this.#srcRef)}
                  id="clippy-image-src"
                  type="url"
                  .value=${this.src}
                  class="utrecht-textbox utrecht-textbox--html-input"
                  @input=${(e: Event) => {
                    this.src = (e.target as HTMLInputElement).value;
                  }}
                  @blur=${(e: Event) => {
                    this.#extractAspectRatio((e.target as HTMLInputElement).value);
                  }}
                  placeholder="https://example.com/image.png"
                  required
                  aria-required="true"
                />
                <clippy-button
                  type="button"
                  purpose="secondary"
                  size="small"
                  @click=${() => this.#fileInputRef.value?.click()}
                >
                  <clippy-icon slot="iconStart">${unsafeSVG(FolderIcon)}</clippy-icon>
                  ${msg('Select')}
                </clippy-button>
              </div>
            </div>

            <div class="utrecht-form-field utrecht-form-field--text">
              <div class="utrecht-form-field__label">
                <label class="utrecht-form-label" for="clippy-image-alt">${msg('Alt text:')}</label>
              </div>
              <div class="utrecht-form-field__input">
                <input
                  id="clippy-image-alt"
                  type="text"
                  .value=${this.alt}
                  class="utrecht-textbox utrecht-textbox--html-input"
                  @input=${(e: Event) => {
                    this.alt = (e.target as HTMLInputElement).value;
                  }}
                  placeholder=${msg('Describe the image for screen readers')}
                />
              </div>
            </div>

            <fieldset class="toolbar-image__dimensions-fieldset">
              <legend class="toolbar-image__dimensions-legend utrecht-form-label">${msg('Dimensions')}</legend>
              <div class="toolbar-image__dimensions-row">
                <div class="utrecht-form-field utrecht-form-field--text">
                  <div class="utrecht-form-field__label">
                    <label class="utrecht-form-label" for="clippy-image-width">${msg('Width')}</label>
                  </div>
                  <div class="utrecht-form-field__input">
                    <input
                      id="clippy-image-width"
                      type="number"
                      .value=${this.width}
                      class="utrecht-textbox utrecht-textbox--html-input"
                      @input=${this.#handleWidthInput}
                      min="1"
                      placeholder="px"
                    />
                  </div>
                </div>

                <clippy-button
                  purpose=${this.constrainProportions ? 'secondary' : 'primary'}
                  toggle
                  icon-only
                  @click=${() => {
                    this.constrainProportions = !this.constrainProportions;
                  }}
                  .pressed=${String(this.constrainProportions)}
                  style="margin-block-end: var(--basis-space-block-lg);"
                >
                  <clippy-icon slot="iconStart">
                    ${this.constrainProportions ? unsafeSVG(LockIcon) : unsafeSVG(LockOpenIcon)}
                  </clippy-icon>
                  ${this.constrainProportions ? msg('Unlock aspect ratio') : msg('Lock aspect ratio')}
                </clippy-button>

                <div class="utrecht-form-field utrecht-form-field--text">
                  <div class="utrecht-form-field__label">
                    <label class="utrecht-form-label" for="clippy-image-height">${msg('Height')}</label>
                  </div>
                  <div class="utrecht-form-field__input">
                    <input
                      id="clippy-image-height"
                      type="number"
                      .value=${this.height}
                      class="utrecht-textbox utrecht-textbox--html-input"
                      @input=${this.#handleHeightInput}
                      min="1"
                      placeholder="px"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <div class="toolbar-image__actions">
              ${isEditing
                ? html`
                    <clippy-button
                      type="button"
                      purpose="secondary"
                      hint="negative"
                      @click=${this.#removeImage}
                      style="margin-inline-end: auto"
                    >
                      ${msg('Remove image')}
                    </clippy-button>
                  `
                : nothing}
              <clippy-button type="button" @click=${() => this.modalDialog.close()}>${msg('Close')}</clippy-button>
              <button type="submit" class="nl-button nl-button--primary">
                ${isEditing ? msg('Update') : msg('Insert image')}
              </button>
            </div>
          </form>
        </div>
      </clippy-modal>
    `;
  }
}
