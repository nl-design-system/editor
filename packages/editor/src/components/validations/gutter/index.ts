import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { html, LitElement, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { ResizeController } from '@/controllers/ResizeController.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import { type ValidationKey, validationMessages } from '@/messages';
import gutterStyles from './styles.ts';

const tag = 'clippy-validations-gutter';
const MIN_GUTTER_ITEM_HEIGHT = 8;

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Gutter;
  }
}

@localized()
@safeCustomElement(tag)
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles, unsafeCSS(paragraphStyle)];

  @property({ type: String })
  mode: 'tooltip' | 'list' | 'readonly' = 'tooltip';

  /**
   * Optional reference element used for indicator positioning and resize
   * observation when no TipTap editor context is available (standalone use).
   * Pass the element that wraps the content being validated.
   */
  @property({ attribute: false })
  contentElement?: HTMLElement;

  @state()
  private activeRange: Range | null = null;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  private editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  readonly #closeValidationItem = () => {
    this.activeRange = null;
  };

  readonly #resizeController = new ResizeController(this);

  #handleIndicatorClick(range: Range) {
    if (this.mode === 'list') {
      this.dispatchEvent(
        new CustomEvent(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, {
          bubbles: true,
          composed: true,
          detail: { range },
        }),
      );
    } else {
      this.activeRange = this.activeRange === range ? null : range;
    }
  }

  readonly #handleFocusValidationItemInGutter = (event: Event) => {
    const { range } = (event as CustomEvent<{ range: Range }>).detail;
    this.activeRange = this.activeRange === range ? null : range;
  };

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, this.#handleFocusValidationItemInGutter);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#closeValidationItem);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeValidationItem);
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('editor')) {
      // Detach any previous observer tied to the old editor DOM.
      if (!this.contentElement) {
        this.#resizeController.disconnect();
      }
      const previousEditor = changedProperties.get('editor') as Editor | undefined;
      previousEditor?.off('create', this.#attachResizeObserver);

      if (this.editor) {
        // editor.view is a getter that throws in TipTap 3.x when not yet mounted.
        let editorDom: HTMLElement | null = null;
        try {
          editorDom = this.editor.view?.dom ?? null;
        } catch {
          // Not mounted yet — will wait for the 'create' event.
        }
        if (editorDom) {
          // Editor already mounted — attach the resize observer immediately.
          this.#attachResizeObserver();
        } else {
          // Editor not yet mounted — listen for the create event.
          this.editor.on('create', this.#attachResizeObserver);
        }
      }
    }

    if (changedProperties.has('contentElement')) {
      if (this.contentElement) {
        this.#resizeController.observe(this.contentElement);
      } else if (!this.editor?.view?.dom) {
        this.#resizeController.disconnect();
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.removeEventListener(
      CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER,
      this.#handleFocusValidationItemInGutter,
    );
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#closeValidationItem);
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeValidationItem);
    this.editor?.off('create', this.#attachResizeObserver);
  }

  readonly #attachResizeObserver = () => {
    const dom = this.contentElement ?? this.editor?.view?.dom;
    if (!dom) return;
    this.#resizeController.observe(dom);
  };

  /**
   * Compute the top offset and height of a gutter indicator for the given
   * range.  Uses the gutter host element as the reference rectangle so that
   * positioning is correct regardless of whether a TipTap editor is present.
   * The host is always rendered at `inset-block-start: 0` inside its
   * containing block, so its top equals the container's top.
   */
  #getIndicatorPosition(range: Range): { top: number; height: number } | null {
    try {
      const rangeRect = range.getBoundingClientRect();
      if (rangeRect.width === 0 && rangeRect.height === 0) return null;
      const hostRect = this.getBoundingClientRect();
      return {
        height: Math.max(rangeRect.height, MIN_GUTTER_ITEM_HEIGHT),
        top: rangeRect.top - hostRect.top,
      };
    } catch {
      return null;
    }
  }

  override render() {
    if (!this.validationsContext || this.validationsContext.size === 0) {
      return nothing;
    }

    return html`
      <ol class="clippy-validations-gutter__list" role="list" data-testid="clippy-validations-gutter">
        ${[...this.validationsContext.entries()]
          .filter(([range]) => range !== undefined)
          .map(([range, { correct, severity, tipPayload, validatorKey }]) => {
            const position = this.#getIndicatorPosition(range);
            if (!position) return nothing;
            const valKey = validatorKey as ValidationKey;
            const { customCorrectLabel, description, href, tip } = validationMessages()[valKey];
            const tipHtml = tip?.(tipPayload) ?? null;
            const isActive = this.activeRange === range;
            return html`<li
              class="clippy-validations-gutter__indicator"
              style="inset-block-start: ${position.top}px; block-size: ${position.height}px"
            >
              <button
                class="${classMap({
                  [`clippy-validations-gutter__toggle--${severity}`]: true,
                  'clippy-validations-gutter__toggle': true,
                  'clippy-validations-gutter__toggle--active': isActive,
                })}"
                aria-expanded=${isActive ? 'true' : 'false'}
                aria-label=${description}
                @click=${() => this.#handleIndicatorClick(range)}
              ></button>
              <div
                class="${classMap({
                  'clippy-validation-gutter__tooltip': true,
                  'clippy-validation-gutter__tooltip--active': isActive,
                })}"
              >
                <clippy-validation-item
                  .mode=${this.mode}
                  .range=${range}
                  .severity=${severity}
                  .description=${description}
                  .href=${href}
                  .customCorrectLabel=${customCorrectLabel}
                  .correct=${correct}
                >
                  ${tipHtml ? html`<p slot="tip-html" class="nl-paragraph">${tipHtml}</p>` : nothing}
                </clippy-validation-item>
              </div>
            </li>`;
          })}
      </ol>
    `;
  }
}
