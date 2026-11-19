import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { localizeHost } from '@/localization';
import { DrawerController } from './DrawerController';
import drawerStyles from './styles';

const tag = 'clippy-sidebar';

/**
 * Panel docked at the end side of the screen, with a header, a body and an optional footer.
 * While it is open, the page narrows by its width, and another open drawer on the page closes.
 * It knows nothing about what is slotted into it.
 *
 * @tag clippy-sidebar
 *
 * @slot header - Shown on one line with the close button. Defaults to a heading with the `label`.
 * @slot - The body, which scrolls.
 * @slot footer - Optional; the footer is hidden while nothing is slotted into it.
 *
 * @fires {Event} close - When the close button or Escape closes the drawer.
 * @fires {ToggleEvent} toggle - Once the drawer shows that it opened or closed.
 *
 * @example
 * ```html
 * <clippy-sidebar label="Fouten, waarschuwingen of tips" open>
 *   <h3 slot="header">Fouten, waarschuwingen of tips</h3>
 *   ...
 * </clippy-sidebar>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class Drawer extends LitElement {
  static override readonly styles = [drawerStyles];

  constructor() {
    super();
    this.addController(new DrawerController(this));
  }

  @property({ reflect: true, type: Boolean })
  open = false;

  /** Accessible name of the drawer region, and its heading unless a header is slotted. */
  @property()
  label = '';

  @state()
  private hasFooter = false;

  /** Focus the heading with the `label`, shown while nothing is slotted into the header. */
  override focus() {
    this.shadowRoot?.querySelector<HTMLElement>('.clippy-drawer__heading')?.focus();
  }

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  readonly #close = () => {
    this.open = false;
    this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
  };

  readonly #handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#close();
    }
  };

  readonly #handleFooterSlotChange = (event: Event) => {
    this.hasFooter = (event.target as HTMLSlotElement).assignedElements().length > 0;
  };

  override render() {
    return html`
      <div
        class="clippy-drawer"
        role="region"
        aria-label=${this.label}
        ?hidden=${!this.open}
        @keydown=${this.#handleKeydown}
      >
        <div class="clippy-drawer__header">
          <div class="clippy-drawer__header-content">
            <slot name="header"><h3 class="clippy-drawer__heading" tabindex="-1">${this.label}</h3></slot>
          </div>
          <clippy-button class="clippy-drawer__close-button" icon-only purpose="subtle" @click=${this.#close}>
            <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
            ${msg('Close')}
          </clippy-button>
        </div>
        <div class="clippy-drawer__body"><slot></slot></div>
        <div class="clippy-drawer__footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${this.#handleFooterSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Drawer;
  }
}
