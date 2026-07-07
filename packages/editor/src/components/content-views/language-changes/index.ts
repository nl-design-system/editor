import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { htmlDocumentContext } from '@/context/htmlDocumentContext';
import { tiptapContext } from '@/context/tiptapContext';
import { findNearestAncestorAttribute } from '@/utils/domTraverser';
import languageChangesStyles from './styles';

const PREVIEW_LENGTH = 20;

interface LanguageChangeEntry {
  element: Element;
  index: number;
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
  ];

  @consume({ context: htmlDocumentContext, subscribe: true })
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  editor?: Editor;

  /** Returns the ambient document language by walking up the DOM from the
   * editor view element, crossing shadow roots as needed. */
  #resolveDocLang(): string | null {
    return findNearestAncestorAttribute(this.htmlDocument || null, 'lang');
  }

  get #languageChanges(): LanguageChangeEntry[] {
    if (!this.htmlDocument) return [];
    const entries: LanguageChangeEntry[] = [];

    const docLang = this.#resolveDocLang();
    let prevLang: string = docLang ?? '';
    let index = 0;

    // Walk all elements that carry a lang attribute in document order.
    const walker = document.createTreeWalker(this.htmlDocument, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node: Node) =>
        (node as Element).hasAttribute('lang') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
    });

    let node = walker.nextNode() as Element | null;
    while (node) {
      const lang = node.getAttribute('lang') ?? '';
      if (lang !== prevLang) {
        const fullText = node.textContent ?? '';
        entries.push({
          element: node,
          index: index++,
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

  #scrollToNode(index: number, element: Element) {
    try {
      // Collect [lang] elements from the rendered DOM in the same tree order
      const renderedEl = this.editor?.view?.dom
        ? (Array.from(this.editor.view.dom.querySelectorAll<Element>('[lang]'))[index] ?? element)
        : element;
      renderedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error('[clippy-language-changes] Cannot scroll to node', err);
    }
  }

  override render() {
    const entries = this.#languageChanges;

    return html`
      <nav aria-label=${msg('Language changes')}>
        ${
          entries.length > 0
            ? html`
                <ol class="clippy-language-changes__list" role="list">
                  ${map(entries, ({ element, index, isDocumentLanguage, lang, preview, truncated }) => {
                    return html`
                      <li class="clippy-language-changes__item">
                        <span class="nl-data-badge" aria-label=${msg('Language: ') + lang}>${lang}</span>
                        <div class="clippy-language-changes__item-content">
                          <a
                            class="nl-link"
                            href="#"
                            @click=${(e: Event) => {
                              e.preventDefault();
                              this.#scrollToNode(index, element);
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
