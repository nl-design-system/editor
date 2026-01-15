import type { Editor } from '@tiptap/core';
import { ClippyModal } from '@nl-design-system-community/clippy-components/clippy-modal';
import LinkIcon from '@tabler/icons/outline/link.svg?raw';
import { html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '../clippy-button';
import '../clippy-icon';
import { editor } from '@/decorators/TipTapDecorator.ts';

const ariaDescribedby = 'clippy-toolbar-link-dialog';

const tag = 'clippy-toolbar-link';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ToolbarLink;
  }
}

@customElement(tag)
export class ToolbarLink extends LitElement {
  @query('clippy-modal')
  private readonly modalDialog!: ClippyModal;

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
    this.modalDialog.close();
  };

  readonly #updateLink = () => {
    const url = this.#inputRef.value?.value || '';
    try {
      this.editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } catch (error) {
      console.error(error);
    }
    this.modalDialog.close();
  };

  readonly #openLinkDialog = () => {
    this.previousUrl = this.editor?.getAttributes('link')['href'];
    this.modalDialog.open();
  };

  override render() {
    return html`
        <clippy-button
          @click=${this.#openLinkDialog}
          aria-controls="clippy-link-dialog"
          .pressed=${this.editor?.isActive('link') ?? false}
          icon-only
          size="small"
          purpose="secondary"
        >
          <clippy-icon slot="iconStart">${unsafeSVG(LinkIcon)}</clippy-icon>
          Link
        </clippy-button>
        <clippy-modal
          .title="Link toevoegen"
          actions="none"
          aria-describedby=${ariaDescribedby}
          data-testid="clippy-link-dialog"
        >
          <p id=${ariaDescribedby}>Link toevoegen</p>
          <div>
            <label>Link to:<input value=${this.previousUrl} ${ref(this.#inputRef)} type="text" /></label>
          </div>
          <div>
            <clippy-button @click=${() => this.modalDialog.close()}>Sluiten</clippy-button>
            <clippy-button purpose="secondary" hint="negative" @click=${this.#unsetLink}>
              Verwijder link
            </clippy-button>
            <clippy-button purpose="primary" @click=${this.#updateLink}>Link toevoegen</clippy-button>
          </div>
        </clippy-modal>
      </clippy-button>
    `;
  }
}
