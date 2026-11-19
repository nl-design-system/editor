import { localized, msg, str } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import ExternalLinkIcon from '@tabler/icons/outline/external-link.svg?raw';
import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { map } from 'lit/directives/map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ViolationsMap, Violation } from '@/types/validation';
import { CustomEvents, type FocusNodeDetail } from '@/events';
import '@/components/validations/validation-button';
import { localizeHost } from '@/localization';
import { getViolationsByElement } from '@/utils/validations';
import headingStructureStyles from './styles';

interface HeadingEntry {
  element: HTMLElement;
  level: number;
  text: string;
  violations: Violation[];
}

const tag = 'clippy-heading-structure';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: HeadingStructure;
  }
}

@localized()
@safeCustomElement(tag)
export class HeadingStructure extends LitElement {
  static override readonly styles = [
    unsafeCSS(dataBadgeStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
    unsafeCSS(buttonCss),
    unsafeCSS(headingStyle),
    headingStructureStyles,
  ];

  /** The validated element to read, pushed by the Drawer. */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  /** Identifier of the Clippy hub, used to scope the focus event. */
  @property({ attribute: false })
  identifier?: string;

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  /** The violations that mark an entry, pushed by the Drawer. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  get #headings(): HeadingEntry[] {
    const root = this.htmlDocument;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')).map((element) => ({
      element,
      level: Number.parseInt(element.tagName[1], 10),
      text: element.textContent ?? '',
      violations: getViolationsByElement(this.violationsMap, element),
    }));
  }

  #scrollToHeading(element: HTMLElement) {
    element.scrollIntoView({ block: 'start' });
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
    const headings = this.#headings;

    return html`
      <div class="clippy-heading-structure__intro">
        <h3 class="nl-heading nl-heading--level-3">${msg('Heading structure')}</h3>
        <p class="nl-paragraph">
          ${msg(
            'This view shows all headings in the text, in order and indented by their level. Headings show the structure of the text. People who use a screen reader use them to get an overview and to go straight to a section, so start with heading level 1 and do not skip a level.',
          )}
        </p>
        <a
          class="nl-button nl-button--secondary"
          href="https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/"
          target="_blank"
          rel="noreferrer"
        >
          <span class="nl-button__label">${msg('Guidelines for headings')}</span>
          <clippy-icon class="nl-button__icon-end">${unsafeSVG(ExternalLinkIcon)}</clippy-icon>
        </a>
      </div>
      <nav aria-label=${msg('Heading structure')}>
        ${
          headings.length > 0
            ? html`
                <ol class="clippy-heading-structure__list" role="list">
                  ${map(headings, ({ element, level, text, violations }) => {
                    const [highest] = violations;
                    const buttonClasses = {
                      [`clippy-heading-structure__button--${highest?.severity}`]: Boolean(highest),
                      'clippy-heading-structure__button': true,
                      'nl-button': true,
                      'nl-button--subtle': true,
                    };
                    return html`
                      <li class="clippy-heading-structure__item" data-level="${level}">
                        <button
                          class=${classMap(buttonClasses)}
                          @click=${(e: Event) => {
                            e.preventDefault();
                            this.#scrollToHeading(element);
                          }}
                        >
                          <span class="nl-data-badge" aria-label=${msg(str`Heading level ${level}`)}>H${level}</span>
                          <span class="clippy-heading-structure__text">${text || msg('(empty)')}</span>
                        </button>
                        ${
                          violations.length > 0
                            ? html`<clippy-validation-button
                                .violations=${violations}
                                .identifier=${this.identifier}
                              ></clippy-validation-button>`
                            : nothing
                        }
                      </li>
                    `;
                  })}
                </ol>
              `
            : html`
                <p class="nl-paragraph clippy-heading-structure__empty">
                  ${msg('No headings found in this document.')}
                </p>
              `
        }
      </nav>
    `;
  }
}
