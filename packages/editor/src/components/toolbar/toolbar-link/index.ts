import type { Editor } from '@tiptap/core';
import LinkIcon from '@tabler/icons/outline/link.svg?raw';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { editor } from '@/decorators/TipTapDecorator.ts';

@customElement('clippy-toolbar-link')
export class ToolbarLink extends LitElement {
  static override readonly styles = [];

  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();
  readonly #inputRef: Ref<HTMLInputElement> = createRef();

  @state()
  previousUrl = '';
  @state()
  position = 0;
  @state()
  replace = false;

  @editor()
  private readonly editor: Editor | undefined;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  readonly #unsetLink = () => {
    this.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    this.#dialogRef.value?.close();
  };

  readonly #updateLink = () => {
    const url = this.#inputRef.value?.value || '';
    try {
      this.editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } catch (error) {
      console.error(error);
    }
    this.#dialogRef.value?.close();
  };

  readonly #openLinkDialog = () => {
    this.previousUrl = this.editor?.getAttributes('link')['href'];
    this.#dialogRef.value?.showModal();
  };

  override render() {
    return html`
      <clippy-toolbar-button
        class="clippy-toolbar-link--button"
        @click=${this.#openLinkDialog}
        label="Link"
        aria-controls="clippy-link-dialog"
        .pressed=${this.editor?.isActive('link') ?? false}
      >
        ${unsafeSVG(LinkIcon)}
      </clippy-toolbar-button>
      <dialog closedby="any" id="clippy-link-dialog" class="link--dialog" ${ref(this.#dialogRef)}>
        <div>
          <label>Link to:<input value=${this.previousUrl} ${ref(this.#inputRef)} type="text" /></label>
        </div>
        <utrecht-button-group>
          <utrecht-button @click=${() => this.#dialogRef.value?.close()}>Sluiten</utrecht-button>
          <utrecht-button @click=${this.#unsetLink}>Verwijder link</utrecht-button>
          <utrecht-button appearance="secondary-action-button" @click=${this.#updateLink}
            >Link toevoegen</utrecht-button
          >
        </utrecht-button-group>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-toolbar-link': ToolbarLink;
  }
}
