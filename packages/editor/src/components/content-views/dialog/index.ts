import { localized, msg } from '@lit/localize';
import LinkIcon from '@tabler/icons/outline/link.svg?raw';
import ListIcon from '@tabler/icons/outline/list.svg?raw';
import X from '@tabler/icons/outline/x.svg?raw';
import drawerStyle from '@utrecht/drawer-css/dist/index.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents, type DocumentOverviewMode, type OpenDocumentOverviewDetail } from '@/events';
import '../heading-structure';
import '../link-list';
import contentViewsDialogStyles from './styles.ts';

const tag = 'clippy-content-views-dialog';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ContentViewDialog;
  }
}

@localized()
@safeCustomElement(tag)
export class ContentViewDialog extends LitElement {
  static override readonly styles = [contentViewsDialogStyles, unsafeCSS(drawerStyle)];

  @state()
  private open = false;

  @state()
  private mode: DocumentOverviewMode = 'heading-structure';

  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();

  #openHandler: ((event: Event) => void) | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.#openHandler = (event: Event) => {
      const { mode } = (event as CustomEvent<OpenDocumentOverviewDetail>).detail;
      this.mode = mode;
      this.#open();
    };
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#openHandler);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#openHandler) {
      globalThis.removeEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#openHandler);
    }
  }

  #open() {
    if (this.open) return;
    this.#dialogRef.value?.show();
    this.open = true;
  }

  #close() {
    this.#dialogRef.value?.close();
    this.open = false;
  }

  override render() {
    return html`
      <dialog
        ${ref(this.#dialogRef)}
        id="clippy-content-views-dialog"
        class="utrecht-drawer utrecht-drawer--inline-start clippy-content-views-dialog__dialog"
        aria-label=${msg('Document overview')}
      >
        <!-- Topbar with mode-switching lives inside the dialog -->
        <div class="clippy-content-views-dialog__topbar">
          <div class="clippy-content-views-dialog__modes" role="tablist" aria-label=${msg('Document overview')}>
            <clippy-button
              purpose="subtle"
              @click=${() => {
                this.mode = 'heading-structure';
              }}
            >
              <clippy-icon slot="iconStart">${unsafeSVG(ListIcon)}</clippy-icon>
              ${msg('Heading structure')}
            </clippy-button>

            <clippy-button
              purpose="subtle"
              @click=${() => {
                this.mode = 'link-list';
              }}
            >
              <clippy-icon slot="iconStart">${unsafeSVG(LinkIcon)}</clippy-icon>
              ${msg('Links')}
            </clippy-button>
          </div>

          <clippy-button icon-only purpose="subtle" @click=${() => this.#close()}>
            <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
            ${msg('Close')}
          </clippy-button>
        </div>

        <!-- Heading structure panel -->
        <div role="tabpanel" aria-label=${msg('Heading structure')} ?hidden=${this.mode !== 'heading-structure'}>
          <clippy-heading-structure></clippy-heading-structure>
        </div>

        <!-- Link list panel -->
        <div role="tabpanel" aria-label=${msg('Links')} ?hidden=${this.mode !== 'link-list'}>
          <clippy-link-list></clippy-link-list>
        </div>
      </dialog>
    `;
  }
}
