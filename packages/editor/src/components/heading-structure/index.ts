import type { Editor as TiptapEditor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import dataBadgeStyle from '@nl-design-system-candidate/data-badge-css/data-badge.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import ListIcon from '@tabler/icons/outline/list.svg?raw';
import X from '@tabler/icons/outline/x.svg?raw';
import drawerStyle from '@utrecht/drawer-css/dist/index.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import type { ValidationsMap, ValidationSeverity } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import headingStructureStyles from './styles.ts';

interface HeadingEntry {
  level: number;
  pos: number;
  text: string;
}

const tag = 'clippy-heading-structure';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: HeadingStructure;
  }
}

/**
 * Displays the heading structure (table of contents) of the TipTap document
 * in a side drawer. Intended for use inside `<clippy-content-view>`.
 *
 * Accessibility: the drawer is a `<dialog>` (non-modal), navigable via keyboard.
 * Clicking a heading entry scrolls the content to that heading.
 *
 * @consumes tiptapContext
 *
 * WCAG 2.2 considerations:
 * - 2.1.1 Keyboard: toggle button and all links are keyboard-focusable
 * - 2.4.1 Bypass Blocks: provides document navigation
 * - 4.1.2 Name, Role, Value: dialog has aria-label; toggle has aria-expanded
 */
@localized()
@safeCustomElement(tag)
export class HeadingStructure extends LitElement {
  static override readonly styles = [
    headingStructureStyles,
    unsafeCSS(dataBadgeStyle),
    unsafeCSS(drawerStyle),
    unsafeCSS(headingStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
  ];

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  editor?: TiptapEditor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsMap?: ValidationsMap;

  @state()
  private open = false;

  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();

  readonly #severityOrder: ValidationSeverity[] = ['error', 'warning', 'info'];

  #getWorstSeverityForPos(pos: number): ValidationSeverity | null {
    if (!this.validationsMap?.size) return null;
    let worst: ValidationSeverity | null = null;
    for (const [, result] of this.validationsMap) {
      if (result.pos !== pos) continue;
      const index = this.#severityOrder.indexOf(result.severity);
      if (worst === null || index < this.#severityOrder.indexOf(worst)) {
        worst = result.severity;
      }
    }
    return worst;
  }

  #getWorstSeverityKeyForPos(pos: number): string | null {
    if (!this.validationsMap?.size) return null;
    let worstKey: string | null = null;
    let worstIndex = Infinity;
    for (const [key, result] of this.validationsMap) {
      if (result.pos !== pos) continue;
      const index = this.#severityOrder.indexOf(result.severity);
      if (index < worstIndex) {
        worstIndex = index;
        worstKey = key;
      }
    }
    return worstKey;
  }

  get #headings(): HeadingEntry[] {
    if (!this.editor) return [];
    const headings: HeadingEntry[] = [];
    this.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          level: node.attrs['level'] as number,
          pos,
          text: node.textContent,
        });
      }
    });
    return headings;
  }

  #toggle() {
    const dialog = this.#dialogRef.value;
    if (this.open) {
      dialog?.close();
    } else {
      dialog?.show();
    }
    this.open = !this.open;
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

    const validationKey = this.#getWorstSeverityKeyForPos(pos);
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
      <clippy-button
        class="clippy-heading-structure__toggle"
        purpose="subtle"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls="clippy-heading-structure-dialog"
        @click=${() => this.#toggle()}
      >
        <clippy-icon slot="iconStart">${unsafeSVG(ListIcon)}</clippy-icon>
        ${msg('Heading structure')}
      </clippy-button>

      <dialog
        ${ref(this.#dialogRef)}
        id="clippy-heading-structure-dialog"
        class="utrecht-drawer utrecht-drawer--inline-start clippy-heading-structure__dialog"
        aria-label=${msg('Heading structure')}
      >
        <div class="clippy-heading-structure__header">
          <h2 class="nl-heading nl-heading--level-3">${msg('Heading structure')}</h2>
          <clippy-button icon-only purpose="subtle" @click=${() => this.#toggle()}>
            <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
            ${msg('Close')}
          </clippy-button>
        </div>

        <nav aria-label=${msg('Document headings')}>
          ${headings.length > 0
            ? html`
                <ol class="clippy-heading-structure__list" role="list">
                  ${map(headings, ({ level, pos, text }) => {
                    const severity = this.#getWorstSeverityForPos(pos);
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
                <p class="nl-paragraph clippy-heading-structure__empty">
                  ${msg('No headings found in this document.')}
                </p>
              `}
        </nav>
      </dialog>
    `;
  }
}
