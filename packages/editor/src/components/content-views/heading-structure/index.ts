import { localized, msg, str } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import linkButtonStyle from '@utrecht/link-button-css/dist/index.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import { map } from 'lit/directives/map.js';
import type { ViolationsMap, Violation } from '@/types/validation';
import { CustomEvents, type FocusValidationItemInGutterDetail } from '@/events';
import { localizeHost } from '@/localization';
import { getHighestSeverityEntryByElement } from '@/utils/validations';
import headingStructureStyles from './styles';

interface HeadingEntry {
  element: HTMLElement;
  level: number;
  text: string;
  validationEntry: [Range, Violation] | null;
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
    headingStructureStyles,
    unsafeCSS(dataBadgeStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
    unsafeCSS(linkButtonStyle),
  ];

  /** The validated element to read, pushed by the Drawer. */
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

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
      validationEntry: getHighestSeverityEntryByElement(this.violationsMap, element),
    }));
  }

  #scrollToHeading(element: HTMLElement) {
    element.scrollIntoView({ block: 'start' });
    const validationRange = getHighestSeverityEntryByElement(this.violationsMap, element)?.[0] ?? null;
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
    const headings = this.#headings;

    return html`
      <nav aria-label=${msg('Heading structure')}>
        ${
          headings.length > 0
            ? html`
                <ol class="clippy-heading-structure__list" role="list">
                  ${map(headings, ({ element, level, text, validationEntry }) => {
                    const severity = validationEntry?.[1].severity;
                    return html`
                      <li class="clippy-heading-structure__item" data-level="${level}">
                        <button
                          class="utrecht-link-button utrecht-link-button--html-button clippy-heading-structure__button"
                          @click=${(e: Event) => {
                            e.preventDefault();
                            this.#scrollToHeading(element);
                          }}
                        >
                          <span
                            class="nl-data-badge${severity ? ` clippy-heading-structure__badge--${severity}` : ''}"
                            aria-label=${msg(str`Heading level ${level}`)}
                            >H${level}</span
                          >
                          <span class="clippy-heading-structure__text">${text || msg('(empty)')}</span>
                        </button>
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
