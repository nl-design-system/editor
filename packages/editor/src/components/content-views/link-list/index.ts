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
import type { ValidationsMap, ValidationResult } from '@/types/validation.ts';
import { htmlDocumentContext } from '@/context/htmlDocumentContext.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { CustomEvents, type FocusValidationItemInGutterDetail } from '@/events';
import { getHighestSeverityEntryByElement } from '@/utils/validations.ts';
import linkListStyles from './styles.ts';

interface LinkEntry {
  element: HTMLAnchorElement;
  index: number;
  href: string;
  text: string;
  validationEntry: [Range, ValidationResult] | null;
}

const tag = 'clippy-link-list';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: LinkList;
  }
}

@localized()
@safeCustomElement(tag)
export class LinkList extends LitElement {
  static override readonly styles = [
    linkListStyles,
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

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsMap?: ValidationsMap;

  get #links(): LinkEntry[] {
    if (!this.htmlDocument) return [];
    return Array.from(this.htmlDocument.querySelectorAll<HTMLAnchorElement>('a[href]')).map((element, index) => ({
      element,
      href: element.getAttribute('href') ?? '',
      index,
      text: element.textContent ?? '',
      validationEntry: getHighestSeverityEntryByElement(this.validationsMap, element),
    }));
  }

  #scrollToLink(index: number, element: HTMLAnchorElement, validationRange: Range | undefined) {
    const renderedEl = this.editor?.view?.dom?.querySelectorAll<HTMLAnchorElement>('a[href]')[index] ?? element;
    renderedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (validationRange) {
      globalThis.dispatchEvent(
        new CustomEvent<FocusValidationItemInGutterDetail>(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, {
          bubbles: true,
          composed: true,
          detail: { range: validationRange },
        }),
      );
    }
  }

  override render() {
    const links = this.#links;

    return html`
      <nav aria-label=${msg('Links')}>
        ${
          links.length > 0
            ? html`
                <ol class="clippy-link-list__list" role="list">
                  ${map(links, ({ element, href, index, text, validationEntry }) => {
                    const severity = validationEntry?.[1].severity ?? null;
                    return html`
                      <li class="clippy-link-list__item">
                        <div class="clippy-link-list__item-header">
                          ${
                            severity
                              ? html`<span
                                  class="nl-data-badge clippy-link-list__badge--${severity}"
                                  aria-label=${severity}
                                ></span>`
                              : ''
                          }
                          <a
                            class="nl-link"
                            href="#"
                            @click=${(e: Event) => {
                              e.preventDefault();
                              this.#scrollToLink(index, element, validationEntry?.[0]);
                            }}
                          >
                            ${text.trim() || msg('(empty)')}
                          </a>
                        </div>
                        ${href ? html`<span class="clippy-link-list__href" title=${href}>${href}</span>` : ''}
                      </li>
                    `;
                  })}
                </ol>
              `
            : html` <p class="nl-paragraph clippy-link-list__empty">${msg('No links found in this document.')}</p> `
        }
      </nav>
    `;
  }
}
