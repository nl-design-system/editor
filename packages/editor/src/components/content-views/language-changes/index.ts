import { localized, msg } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import ExternalLinkIcon from '@tabler/icons/outline/external-link.svg?raw';
import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { CustomEvents, type FocusNodeDetail } from '@/events';
import { localizeHost } from '@/localization';
import { findNearestAncestorAttribute } from '@/utils/domTraverser';
import { ignores } from '@/utils/ignores';
import languageChangesStyles from './styles';

const PREVIEW_LENGTH = 20;

interface LanguageChangeEntry {
  element: Element;
  isDocumentLanguage: boolean;
  lang: string;
  preview: string;
  truncated: boolean;
}

const tag = 'clippy-language-changes';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: LanguageChanges;
  }
}

@localized()
@safeCustomElement(tag)
export class LanguageChanges extends LitElement {
  static override readonly styles = [
    languageChangesStyles,
    unsafeCSS(dataBadgeStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
    unsafeCSS(buttonCss),
    unsafeCSS(headingStyle),
  ];

  /** The validated element to read, pushed by the Drawer. */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  /** Identifier of the Clippy hub, used to scope the focus event. */
  @property({ attribute: false })
  identifier?: string;

  @property({ attribute: false })
  ignores?: string;

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  #resolveDocLang(): string | null {
    return findNearestAncestorAttribute(this.htmlDocument ?? null, 'lang');
  }

  get #languageChanges(): LanguageChangeEntry[] {
    const root = this.htmlDocument;
    if (!root) return [];
    const entries: LanguageChangeEntry[] = [];

    const docLang = this.#resolveDocLang();
    let prevLang: string = docLang ?? '';

    // Walk all elements that carry a lang attribute in document order.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node: Node) => {
        if (ignores(node as Element, this.ignores)) return NodeFilter.FILTER_REJECT;
        return (node as Element).hasAttribute('lang') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });

    let node = walker.nextNode() as Element | null;
    while (node) {
      const lang = node.getAttribute('lang') ?? '';
      if (lang !== prevLang) {
        const fullText = node.textContent ?? '';
        entries.push({
          element: node,
          isDocumentLanguage: docLang !== null && lang === docLang,
          lang,
          preview: fullText.slice(0, PREVIEW_LENGTH),
          truncated: fullText.length > PREVIEW_LENGTH,
        });
        prevLang = lang;
      }
      node = walker.nextNode() as Element | null;
    }

    return entries;
  }

  #scrollToNode(element: Element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const range = document.createRange();
    range.selectNodeContents(element);
    this.dispatchEvent(
      new CustomEvent<FocusNodeDetail>(CustomEvents.FOCUS_NODE, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, range },
      }),
    );
  }

  override render() {
    const entries = this.#languageChanges;
    const documentLanguage = this.#resolveDocLang();

    return html`
      <div class="clippy-language-changes__intro">
        <h3 class="nl-heading nl-heading--level-3">${msg('Language changes')}</h3>
        <p class="nl-paragraph">
          ${msg(
            'This view shows the language of the document and every part of the text in another language. Give text in another language than the document that language, so screen readers pronounce it correctly and translation tools recognise it.',
          )}
        </p>
        <a
          class="nl-button nl-button--secondary"
          href="https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/taal/"
          target="_blank"
          rel="noreferrer"
        >
          <span class="nl-button__label">${msg('Guidelines for setting the right language')}</span>
          <clippy-icon class="nl-button__icon-end">${unsafeSVG(ExternalLinkIcon)}</clippy-icon>
        </a>
      </div>
      <nav aria-label=${msg('Language changes')}>
        <p class="clippy-language-changes__document-language">
          <span class="nl-data-badge">${documentLanguage ?? msg('Not set')}</span>
          ${msg('Document language')}
        </p>
        ${
          entries.length > 0
            ? html`
                <ol class="clippy-language-changes__list" role="list">
                  ${map(entries, ({ element, isDocumentLanguage, lang, preview, truncated }) => {
                    return html`
                      <li class="clippy-language-changes__item">
                        <span class="nl-data-badge" aria-label=${msg('Language: ') + lang}>${lang}</span>
                        <div class="clippy-language-changes__item-content">
                          <a
                            class="nl-link"
                            href="#"
                            @click=${(e: Event) => {
                              e.preventDefault();
                              this.#scrollToNode(element);
                            }}
                          >
                            ${preview || msg('(empty)')}${truncated ? '…' : ''}
                          </a>
                          ${
                            isDocumentLanguage
                              ? html`<span class="clippy-language-changes__doc-label"
                                  >${msg('(document language)')}</span
                                >`
                              : ''
                          }
                        </div>
                      </li>
                    `;
                  })}
                </ol>
              `
            : html`
                <p class="nl-paragraph clippy-language-changes__empty">
                  ${msg('No language changes found in this document.')}
                </p>
              `
        }
      </nav>
    `;
  }
}
