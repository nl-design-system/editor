import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement } from 'lit';
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

/**
 * The Content views of a Clippy hub, which shows them in its drawer: heading structure,
 * links and language changes, one at a time.
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
  static override readonly styles = [contentViewsStyles];

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

  /** The name of the shown Content view. */
  get label(): string {
    return this.#getLabel(this.view);
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

  #renderPanel(view: ContentView, content: unknown) {
    return html`<div ?hidden=${this.view !== view}>${content}</div>`;
  }

  override render() {
    const { htmlDocument, violationsMap } = this;
    return html`
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ContentViews;
  }
}
