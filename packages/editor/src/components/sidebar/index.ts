import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { localizeHost } from '@/localization';
import { SidebarController } from './SidebarController';
import sidebarStyles from './styles';

const tag = 'clippy-sidebar';

/** A view shown in a `clippy-sidebar`, one at a time. */
export interface SidebarView extends HTMLElement {
  open: boolean;
  readonly label: string;
}

const isSidebarView = (element: Element): element is SidebarView => 'open' in element && 'label' in element;

/** Shows `view`, in the sidebar it lives in when there is one. */
export const showSidebarView = (view: SidebarView): void => {
  const sidebar = view.closest(tag);
  if (sidebar) {
    sidebar.show(view);
  } else {
    view.open = true;
  }
};

/** Hides `view`, and closes the sidebar it lives in when it is the view shown there. */
export const hideSidebarView = (view: SidebarView): void => {
  if (!view.open) return;
  const sidebar = view.closest(tag);
  if (sidebar) {
    sidebar.hide();
  } else {
    view.open = false;
  }
};

/**
 * Panel docked at the end side of the screen, with a header, a body and an optional footer.
 * While it is open, the page narrows by its width, and other sidebars on the page close.
 *
 * It can hold views (such as `clippy-validations-view` and `clippy-content-views`) and shows
 * one of them at a time: a view shown with {@link showSidebarView} opens the sidebar and
 * hides the others. A view places its own header beside the close button and its own body.
 *
 * @tag clippy-sidebar
 *
 * @slot header - Shown on one line with the close button, e.g. a heading or tabs.
 * @slot - The body, which scrolls, or the views.
 * @slot footer - Optional; the footer is hidden while nothing is slotted into it.
 *
 * @fires {Event} close - When the close button is clicked or Escape is pressed inside the sidebar.
 * @fires {SidebarToggleEvent} SIDEBAR_TOGGLE - Dispatched on `globalThis` whenever the sidebar
 *   opens, closes or shows another view.
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
export class Sidebar extends LitElement {
  static override readonly styles = [sidebarStyles];

  readonly #controller = new SidebarController(this);

  @property({ reflect: true, type: Boolean })
  open = false;

  /** Accessible name of the sidebar region, unless a view is shown: then that view's label. */
  @property()
  label = '';

  /** The hub identifier that scopes the sidebar events. */
  @property({ attribute: false })
  identifier?: string;

  @state()
  private hasFooter = false;

  get #views(): SidebarView[] {
    return [...this.children].filter(isSidebarView);
  }

  /** Opens the sidebar, showing `view` and hiding its other views. */
  show(view?: SidebarView): void {
    for (const child of this.#views) {
      child.open = child === view;
    }
    this.open = true;
    this.#controller.announce();
    this.requestUpdate();
  }

  /** Closes the sidebar and hides its views. */
  hide(): void {
    for (const child of this.#views) {
      child.open = false;
    }
    this.open = false;
  }

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  readonly #close = () => {
    this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
    this.hide();
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
    const label = this.#views.find((view) => view.open)?.label ?? this.label;
    return html`
      <div
        class="clippy-sidebar"
        role="region"
        aria-label=${label}
        ?hidden=${!this.open}
        @keydown=${this.#handleKeydown}
      >
        <div class="clippy-sidebar__header"><slot name="header"></slot></div>
        <clippy-button class="clippy-sidebar__close-button" icon-only purpose="subtle" @click=${this.#close}>
          <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
          ${msg('Close')}
        </clippy-button>
        <slot></slot>
        <div class="clippy-sidebar__footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${this.#handleFooterSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Sidebar;
  }
}
