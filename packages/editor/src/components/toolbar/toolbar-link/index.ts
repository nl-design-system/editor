import type { Editor } from '@tiptap/core';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import LinkIcon from '@tabler/icons/outline/link.svg?raw';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import './../toolbar-button';
import { editor } from '@/decorators/TipTapDecorator.ts';

const tag = 'clippy-toolbar-link';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ToolbarLink;
  }
}

@customElement(tag)
export class ToolbarLink extends LitElement {
  static override readonly styles = [unsafeCSS(buttonCss)];

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
        label="Link"
      >
        ${unsafeSVG(LinkIcon)}
      </clippy-toolbar-button>
      <dialog closedby="any" class="link--dialog" ${ref(this.#dialogRef)} data-testid="clippy-link-dialog">
        <div>
          <label>Link to:<input value=${this.previousUrl} ${ref(this.#inputRef)} type="text" /></label>
        </div>
        <div>
          <button class="nl-button nl-button--secondary " @click=${() => this.#dialogRef.value?.close()}>
            Sluiten
          </button>
          <button class="nl-button nl-button--secondary nl-button--negative" @click=${this.#unsetLink}>
            Verwijder link
          </button>
          <button class="nl-button nl-button--primary" @click=${this.#updateLink}>Link toevoegen</button>
        </div>
      </dialog>
    `;
  }
}
