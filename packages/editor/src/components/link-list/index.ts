import type { Editor as TiptapEditor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { ValidationsMap, ValidationResult, ValidationSeverity } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import linkListStyles from './styles.ts';

interface LinkEntry {
  href: string;
  pos: number;
  text: string;
}

const tag = 'clippy-link-list';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: LinkList;
  }
}

/**
 * Panel that renders all links in the TipTap document.
 * Intended to be hosted inside `<clippy-content-view-dialog>`.
 *
 * Clicking a link entry scrolls the content to that link in the editor.
 *
 * @consumes tiptapContext
 * @consumes validationsContext
 *
 * WCAG 2.2 considerations:
 * - 2.1.1 Keyboard: all links are keyboard-focusable
 * - 2.4.4 Link Purpose: each entry shows link text and destination URL
 */
@localized()
@safeCustomElement(tag)
export class LinkList extends LitElement {
  static override readonly styles = [
    linkListStyles,
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

  readonly #severityOrder: ValidationSeverity[] = ['error', 'warning', 'info'];

  #getValidationItemsByPosition(pos: number): [string, ValidationResult] | null {
    if (!this.validationsMap?.size) return null;
    return (
      [...this.validationsMap.entries()]
        .filter(([, result]) => result.pos === pos)
        .sort(([, a], [, b]) => this.#severityOrder.indexOf(a.severity) - this.#severityOrder.indexOf(b.severity))
        .at(0) ?? null
    );
  }

  get #links(): LinkEntry[] {
    if (!this.editor) return [];
    const links: LinkEntry[] = [];
    this.editor.state.doc.descendants((node, pos) => {
      if (!node.isText) return;
      const linkMark = node.marks.find((mark) => mark.type.name === 'link');
      if (!linkMark) return;
      const href = (linkMark.attrs['href'] as string) ?? '';
      const text = node.text ?? '';
      const last = links.at(-1);
      // Merge consecutive text nodes that belong to the same link
      if (last?.href === href && last.pos + last.text.length === pos) {
        last.text += text;
      } else {
        links.push({ href, pos, text });
      }
    });
    return links;
  }

  #scrollToLink(pos: number) {
    if (!this.editor) return;
    try {
      const { view } = this.editor;
      const nodeDom = view.nodeDOM?.(pos) ?? view.domAtPos(pos).node;
      const target = nodeDom instanceof HTMLElement ? nodeDom : (nodeDom as Node)?.parentElement;
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('[clippy-link-list] Cannot scroll to link', err);
    }

    const validationKey = this.#getValidationItemsByPosition(pos)?.[0] ?? null;
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
    const links = this.#links;

    return html`
      <nav aria-label=${msg('Links')}>
        ${links.length > 0
          ? html`
              <ol class="clippy-link-list__list" role="list">
                ${map(links, ({ href, pos, text }) => {
                  const severity = this.#getValidationItemsByPosition(pos)?.[1].severity ?? null;
                  return html`
                    <li class="clippy-link-list__item">
                      <div class="clippy-link-list__item-header">
                        ${severity
                          ? html`<span
                              class="nl-data-badge clippy-link-list__badge--${severity}"
                              aria-label=${severity}
                            ></span>`
                          : ''}
                        <a
                          class="nl-link"
                          href="#"
                          @click=${(e: Event) => {
                            e.preventDefault();
                            this.#scrollToLink(pos);
                          }}
                        >
                          ${text || msg('(empty)')}
                        </a>
                      </div>
                      ${href ? html`<span class="clippy-link-list__href" title=${href}>${href}</span>` : ''}
                    </li>
                  `;
                })}
              </ol>
            `
          : html`
              <p class="nl-paragraph clippy-link-list__empty">
                ${msg('No links found in this document.')}
              </p>
            `}
      </nav>
    `;
  }
}

