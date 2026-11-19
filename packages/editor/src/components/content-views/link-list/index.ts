import { localized, msg } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import ExternalLinkIcon from '@tabler/icons/outline/external-link.svg?raw';
import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-icon';
import '@/components/validations/toggle';
import type { ViolationsMap, Violation } from '@/types/validation';
import { CustomEvents, type FocusNodeDetail } from '@/events';
import { localizeHost } from '@/localization';
import { getEntriesByElement } from '@/utils/validations';
import linkListStyles from './styles';

interface LinkEntry {
  element: HTMLAnchorElement;
  href: string;
  text: string;
  validationEntries: [Range, Violation][];
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
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
    unsafeCSS(buttonCss),
    unsafeCSS(headingStyle),
  ];

  /** The validated element to read, pushed by the Content views. */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  /** Identifier of the Clippy hub, used to scope the focus event. */
  @property({ attribute: false })
  identifier?: string;

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  /** The violations that mark an entry, pushed by the Content views. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  get #links(): LinkEntry[] {
    const root = this.htmlDocument;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]')).map((element) => ({
      element,
      href: element.getAttribute('href') ?? '',
      text: element.textContent ?? '',
      validationEntries: getEntriesByElement(this.violationsMap, element),
    }));
  }

  #scrollToLink(element: HTMLAnchorElement, range?: Range) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const focusRange = range ?? document.createRange();
    if (!range) focusRange.selectNodeContents(element);
    this.dispatchEvent(
      new CustomEvent<FocusNodeDetail>(CustomEvents.FOCUS_NODE, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, range: focusRange },
      }),
    );
  }

  override render() {
    const links = this.#links;

    return html`
      <div class="clippy-link-list__intro">
        <h3 class="nl-heading nl-heading--level-3">${msg('Links')}</h3>
      </div>
      <nav aria-label=${msg('Links')}>
        ${
          links.length > 0
            ? html`
                <ol class="clippy-link-list__list" role="list">
                  ${map(links, ({ element, href, text, validationEntries }) => {
                    const severity = validationEntries[0]?.[1].severity;
                    return html`
                      <li class="clippy-link-list__item${severity ? ` clippy-link-list__item--${severity}` : ''}">
                        <div class="clippy-link-list__item-content">
                          <a
                            class="nl-link"
                            href="#"
                            @click=${(e: Event) => {
                              e.preventDefault();
                              this.#scrollToLink(element, validationEntries[0]?.[0]);
                            }}
                          >
                            ${text.trim() || msg('(empty)')}
                          </a>
                          ${href ? html`<span class="clippy-link-list__href" title=${href}>${href}</span>` : ''}
                        </div>
                        ${
                          validationEntries.length > 0
                            ? html`<clippy-validation-toggle
                                .entries=${validationEntries}
                                .identifier=${this.identifier}
                              ></clippy-validation-toggle>`
                            : nothing
                        }
                      </li>
                    `;
                  })}
                </ol>
              `
            : html` <p class="nl-paragraph clippy-link-list__empty">${msg('No links found in this document.')}</p> `
        }
      </nav>
      <div class="clippy-link-list__guideline">
        <p class="nl-paragraph">
          ${msg(
            'All links in the text, with the address they go to. Every link needs a text that says where it goes, also when it is read on its own, for example in the list of links of a screen reader.',
          )}
        </p>
        <a
          class="nl-button nl-button--secondary"
          href="https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/"
          target="_blank"
          rel="noreferrer"
        >
          <span class="nl-button__label">${msg('Guidelines for accessible link texts')}</span>
          <clippy-icon class="nl-button__icon-end">${unsafeSVG(ExternalLinkIcon)}</clippy-icon>
        </a>
      </div>
    `;
  }
}
