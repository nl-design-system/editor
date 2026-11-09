import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { ViolationsMap, Violation } from '@/types/validation';
import { htmlDocumentContext } from '@/context/htmlDocumentContext';
import { violationsContext } from '@/context/violationsContext';
import { CustomEvents, type FocusValidationItemInGutterDetail } from '@/events';
import { localizeHost } from '@/localization';
import { getHighestSeverityEntryByElement } from '@/utils/validations';
import linkListStyles from './styles';

interface LinkEntry {
  element: HTMLAnchorElement;
  href: string;
  text: string;
  validationEntry: [Range, Violation] | null;
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

  /** The validated element to read, pushed by the Drawer. Falls back to the consumed context when unset. */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  @consume({ context: htmlDocumentContext, subscribe: true })
  @state()
  private readonly htmlDocumentContextValue?: HTMLElement;

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  get #root(): HTMLElement | undefined {
    return this.htmlDocument ?? this.htmlDocumentContextValue;
  }

  /** The violations that mark an entry, pushed by the Drawer. Falls back to the consumed context when unset. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  @consume({ context: violationsContext, subscribe: true })
  @state()
  private readonly violationsContextValue?: ViolationsMap;

  get #violations(): ViolationsMap | undefined {
    return this.violationsMap ?? this.violationsContextValue;
  }

  get #links(): LinkEntry[] {
    const root = this.#root;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]')).map((element) => ({
      element,
      href: element.getAttribute('href') ?? '',
      text: element.textContent ?? '',
      validationEntry: getHighestSeverityEntryByElement(this.#violations, element),
    }));
  }

  #scrollToLink(element: HTMLAnchorElement, validationRange: Range | undefined) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                  ${map(links, ({ element, href, text, validationEntry }) => {
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
                              this.#scrollToLink(element, validationEntry?.[0]);
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
