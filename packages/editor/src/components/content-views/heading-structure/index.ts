import type { Editor as TiptapEditor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import type { ValidationsMap, ValidationResult } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import { getHighestSeverityEntryByPosition } from '@/utils/validations.ts';
import headingStructureStyles from './styles.ts';

interface HeadingEntry {
  level: number;
  pos: number;
  text: string;
  validationEntry: [string, ValidationResult] | null;
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
  ];

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  editor?: TiptapEditor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsMap?: ValidationsMap;

  get #headings(): HeadingEntry[] {
    if (!this.editor) return [];
    const headings: HeadingEntry[] = [];
    this.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          level: node.attrs['level'] as number,
          pos,
          text: node.textContent,
          validationEntry: getHighestSeverityEntryByPosition(this.validationsMap, pos),
        });
      }
    });
    return headings;
  }

  #scrollToHeading(pos: number) {
    if (!this.editor) return;
    try {
      const { view } = this.editor;
      const nodeDom = view.nodeDOM?.(pos) ?? view.domAtPos(pos).node;
      if (nodeDom instanceof HTMLElement) {
        nodeDom.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('[clippy-heading-structure] Cannot scroll to heading', err);
    }

    const validationKey = getHighestSeverityEntryByPosition(this.validationsMap, pos)?.[0] ?? null;
    if (validationKey) {
      globalThis.dispatchEvent(
        new CustomEvent(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, {
          bubbles: true,
          composed: true,
          detail: { key: validationKey },
        }),
      );
    }
  }

  override render() {
    const headings = this.#headings;

    return html`
      <nav aria-label=${msg('Heading structure')}>
        ${headings.length > 0
          ? html`
              <ol class="clippy-heading-structure__list" role="list">
                ${map(headings, ({ level, pos, text, validationEntry }) => {
                  const severity = validationEntry?.[1].severity;
                  return html`
                    <li class="clippy-heading-structure__item" data-level="${level}">
                      <span
                        class="nl-data-badge${severity ? ` clippy-heading-structure__badge--${severity}` : ''}"
                        aria-label=${`Heading level ${level}`}
                        >H${level}</span
                      >
                      <a
                        class="nl-link"
                        href="#"
                        @click=${(e: Event) => {
                          e.preventDefault();
                          this.#scrollToHeading(pos);
                        }}
                      >
                        ${text || msg('(empty)')}
                      </a>
                    </li>
                  `;
                })}
              </ol>
            `
          : html`
              <p class="nl-paragraph clippy-heading-structure__empty">${msg('No headings found in this document.')}</p>
            `}
      </nav>
    `;
  }
}
