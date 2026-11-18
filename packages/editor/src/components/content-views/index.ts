import tabsStyles from '@amsterdam/design-system-css/dist/tabs/tabs.css?inline';
import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, unsafeCSS, type PropertyValues } from 'lit';
import '@/components/content-views/heading-structure';
import '@/components/content-views/link-list';
import '@/components/content-views/language-changes';
import { property, state } from 'lit/decorators.js';
import type { ViolationsMap } from '@/types/validation';
import { showSidebarView, type SidebarView } from '@/components/sidebar';
import sidebarViewStyles from '@/components/sidebar/viewStyles';
import { CustomEvents, type DocumentOverviewMode, type OpenDocumentOverviewEvent } from '@/events';
import { localizeHost } from '@/localization';
import contentViewsStyles from './styles';

const tag = 'clippy-content-views';

const CONTENT_VIEWS = ['heading-structure', 'link-list', 'language-changes'] as const;

type ContentView = (typeof CONTENT_VIEWS)[number];

const isContentView = (mode: DocumentOverviewMode): mode is ContentView => CONTENT_VIEWS.includes(mode as ContentView);

const tabId = (view: ContentView) => `clippy-content-views-tab-${view}`;

const panelId = (view: ContentView) => `clippy-content-views-panel-${view}`;

/**
 * View of a `clippy-sidebar` with tabs for the Content views of a Clippy hub: heading
 * structure, links and language changes. Shows on the global
 * `CustomEvents.OPEN_DOCUMENT_OVERVIEW` event for one of those modes, scoped to the hub
 * identifier.
 *
 * @tag clippy-content-views
 *
 * @fires {OpenDocumentOverviewEvent} OPEN_DOCUMENT_OVERVIEW - Listens for this event to
 *   open on the requested Content view.
 *
 * @example
 * ```html
 * <clippy-sidebar>
 *   <clippy-content-views></clippy-content-views>
 * </clippy-sidebar>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ContentViews extends LitElement implements SidebarView {
  static override readonly styles = [sidebarViewStyles, contentViewsStyles, unsafeCSS(tabsStyles)];

  @state()
  private selected: ContentView = CONTENT_VIEWS[0];

  /** The violations that mark an entry, pushed by a Clippy hub. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  /** The validated element, which the Content views read. @see {@link violationsMap} */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  /** @see {@link violationsMap} */
  @property({ attribute: false })
  identifier?: string;

  /** Whether the view is shown. Show it with {@link showSidebarView}, so its sidebar opens. */
  @property({ type: Boolean })
  open = false;

  get label(): string {
    return msg('Document overview');
  }

  /** Focus the selected tab. */
  override focus() {
    this.shadowRoot?.getElementById(tabId(this.selected))?.focus();
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('open')) this.hidden = !this.open;
  }

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    super.disconnectedCallback();
  }

  readonly #handleOverviewOpen = (event: Event) => {
    const { identifier, mode } = (event as OpenDocumentOverviewEvent).detail;
    if (identifier !== this.identifier || !isContentView(mode)) return;
    this.selected = mode;
    showSidebarView(this);
  };

  #getLabel(view: ContentView): string {
    switch (view) {
      case 'heading-structure':
        return msg('Heading structure');
      case 'link-list':
        return msg('Links');
      default:
        return msg('Language changes');
    }
  }

  readonly #handleTabKeydown = async (event: KeyboardEvent) => {
    const next = this.#getNextContentView(event.key, CONTENT_VIEWS.indexOf(this.selected));
    if (!next) return;

    event.preventDefault();
    this.selected = next;
    await this.updateComplete;
    this.focus();
  };

  #getNextContentView(key: string, index: number): ContentView | undefined {
    const { length } = CONTENT_VIEWS;
    switch (key) {
      case 'ArrowRight':
        return CONTENT_VIEWS[(index + 1) % length];
      case 'ArrowLeft':
        return CONTENT_VIEWS[(index - 1 + length) % length];
      case 'Home':
        return CONTENT_VIEWS[0];
      case 'End':
        return CONTENT_VIEWS[length - 1];
      default:
        return undefined;
    }
  }

  #renderTabs() {
    return html`<div class="clippy-sidebar-view__header clippy-content-views__tabs ams-tabs__list" role="tablist">
      ${CONTENT_VIEWS.map((view) => {
        const selected = view === this.selected;
        const label = this.#getLabel(view);
        return html`<button
          class="ams-tabs__button"
          id=${tabId(view)}
          role="tab"
          type="button"
          aria-controls=${panelId(view)}
          aria-selected=${selected}
          tabindex=${selected ? 0 : -1}
          @click=${() => (this.selected = view)}
          @keydown=${this.#handleTabKeydown}
        >
          <span class="ams-tabs__button-label">${label}</span>
          <span class="ams-tabs__button-label-hidden">${label}</span>
        </button>`;
      })}
    </div>`;
  }

  #renderPanel(view: ContentView, content: unknown) {
    return html`<div
      class="ams-tabs__panel"
      id=${panelId(view)}
      role="tabpanel"
      aria-labelledby=${tabId(view)}
      tabindex="0"
      ?hidden=${this.selected !== view}
    >
      ${content}
    </div>`;
  }

  override render() {
    const { htmlDocument, violationsMap } = this;
    return html`
      ${this.#renderTabs()}
      <div class="clippy-sidebar-view__body">
        ${this.#renderPanel(
          'heading-structure',
          html`<clippy-heading-structure
            .htmlDocument=${htmlDocument}
            .identifier=${this.identifier}
            .violationsMap=${violationsMap}
          ></clippy-heading-structure>`,
        )}
        ${this.#renderPanel(
          'link-list',
          html`<clippy-link-list
            .htmlDocument=${htmlDocument}
            .identifier=${this.identifier}
            .violationsMap=${violationsMap}
          ></clippy-link-list>`,
        )}
        ${this.#renderPanel(
          'language-changes',
          html`<clippy-language-changes
            .htmlDocument=${htmlDocument}
            .identifier=${this.identifier}
          ></clippy-language-changes>`,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ContentViews;
  }
}
