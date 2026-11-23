import tabsStyles from '@amsterdam/design-system-css/dist/tabs/tabs.css?inline';
import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, unsafeCSS } from 'lit';
import '@/components/content-views/heading-structure';
import '@/components/content-views/link-list';
import '@/components/content-views/language-changes';
import { property } from 'lit/decorators.js';
import type { DocumentOverviewMode } from '@/events';
import type { ViolationsMap } from '@/types/validation';
import { localizeHost } from '@/localization';
import contentViewsStyles from './styles';

const tag = 'clippy-content-views';

const CONTENT_VIEWS = ['heading-structure', 'link-list', 'language-changes'] as const;

export type ContentView = (typeof CONTENT_VIEWS)[number];

export const isContentView = (mode: DocumentOverviewMode): mode is ContentView =>
  CONTENT_VIEWS.includes(mode as ContentView);

const tabId = (view: ContentView) => `clippy-content-views-tab-${view}`;

const panelId = (view: ContentView) => `clippy-content-views-panel-${view}`;

/**
 * The Content views of a Clippy hub, which shows them in its drawer: heading structure,
 * links and language changes, with tabs to switch between them.
 *
 * @tag clippy-content-views
 *
 * @example
 * ```html
 * <clippy-content-views view="link-list"></clippy-content-views>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ContentViews extends LitElement {
  static override readonly styles = [contentViewsStyles, unsafeCSS(tabsStyles)];

  /** The Content view to show. */
  @property()
  view: ContentView = CONTENT_VIEWS[0];

  /** The violations that mark an entry, pushed by a Clippy hub. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  /** The validated element, which the Content views read. @see {@link violationsMap} */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  /** @see {@link violationsMap} */
  @property({ attribute: false })
  identifier?: string;

  @property({ attribute: false })
  ignores?: string;

  /** The name of the Content views. */
  get label(): string {
    return msg('Document overview');
  }

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

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
    const next = this.#getNextContentView(event.key, CONTENT_VIEWS.indexOf(this.view));
    if (!next) return;

    event.preventDefault();
    this.view = next;
    await this.updateComplete;
    this.shadowRoot?.getElementById(tabId(next))?.focus();
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
    return html`<div class="clippy-content-views__tabs ams-tabs__list" role="tablist">
      ${CONTENT_VIEWS.map((view) => {
        const selected = view === this.view;
        const label = this.#getLabel(view);
        return html`<button
          class="ams-tabs__button"
          id=${tabId(view)}
          role="tab"
          type="button"
          aria-controls=${panelId(view)}
          aria-selected=${selected}
          tabindex=${selected ? 0 : -1}
          @click=${() => (this.view = view)}
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
      ?hidden=${this.view !== view}
    >
      ${content}
    </div>`;
  }

  override render() {
    const { htmlDocument, ignores, violationsMap } = this;
    return html`
      ${this.#renderTabs()}
      ${this.#renderPanel(
        'heading-structure',
        html`<clippy-heading-structure
          .htmlDocument=${htmlDocument}
          .identifier=${this.identifier}
          .ignores=${ignores}
          .violationsMap=${violationsMap}
        ></clippy-heading-structure>`,
      )}
      ${this.#renderPanel(
        'link-list',
        html`<clippy-link-list
          .htmlDocument=${htmlDocument}
          .identifier=${this.identifier}
          .ignores=${ignores}
          .violationsMap=${violationsMap}
        ></clippy-link-list>`,
      )}
      ${this.#renderPanel(
        'language-changes',
        html`<clippy-language-changes
          .htmlDocument=${htmlDocument}
          .identifier=${this.identifier}
          .ignores=${ignores}
        ></clippy-language-changes>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ContentViews;
  }
}
