import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
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
import type { ValidationsMap, ValidationResult } from '@/types/validation';
import { htmlDocumentContext } from '@/context/htmlDocumentContext';
import { tiptapContext } from '@/context/tiptapContext';
import { validationsContext } from '@/context/validationsContext';
import { CustomEvents, type FocusValidationItemInGutterDetail } from '@/events';
import { getHighestSeverityEntryByElement } from '@/utils/validations';
import headingStructureStyles from './styles';

interface HeadingEntry {
  element: HTMLElement;
  index: number;
  level: number;
  text: string;
  validationEntry: [Range, ValidationResult] | null;
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

  @consume({ context: htmlDocumentContext, subscribe: true })
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsMap?: ValidationsMap;

  get #headings(): HeadingEntry[] {
    if (!this.htmlDocument) return [];
    return Array.from(this.htmlDocument.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')).map(
      (element, index) => ({
        element,
        index,
        level: Number.parseInt(element.tagName[1], 10),
        text: element.textContent ?? '',
        validationEntry: getHighestSeverityEntryByElement(this.validationsMap, element),
      }),
    );
  }

  #scrollToHeading(index: number, element: HTMLElement) {
    const renderedEl =
      this.editor?.view?.dom?.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')[index] ?? element;
    renderedEl.scrollIntoView({ block: 'start' });
    const validationRange = getHighestSeverityEntryByElement(this.validationsMap, element)?.[0] ?? null;
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
                  ${map(headings, ({ index, level, text, validationEntry }) => {
                    const severity = validationEntry?.[1].severity;
                    return html`
                      <li class="clippy-heading-structure__item" data-level="${level}">
                        <button
                          class="utrecht-link-button utrecht-link-button--html-button clippy-heading-structure__button"
                          @click=${(e: Event) => {
                            e.preventDefault();
                            this.#scrollToHeading(index, this.#headings[index].element);
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
