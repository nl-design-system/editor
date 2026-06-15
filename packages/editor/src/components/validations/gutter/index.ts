import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { ResizeController } from '@/controllers/ResizeController.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents, type FocusValidationItemInGutterEvent, type FocusValidationItemInListDetail } from '@/events';
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

  @state()
  private activeRange: Range | null = null;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  private readonly editor?: Editor;

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
        new CustomEvent<FocusValidationItemInListDetail>(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, {
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
    const { range } = (event as FocusValidationItemInGutterEvent).detail;
    this.activeRange = this.activeRange === range ? null : range;
  };

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, this.#handleFocusValidationItemInGutter);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#closeValidationItem);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeValidationItem);
  }

  override firstUpdated() {
    this.editor?.on('create', this.#attachResizeObserver);
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
    const dom = this.editor?.view?.dom;
    if (!dom) return;
    this.#resizeController.observe(dom);
  };

  #getIndicatorPosition(range: Range): { top: number; height: number } | null {
    try {
      const rangeRect = range.getBoundingClientRect();
      if (rangeRect.width === 0 && rangeRect.height === 0) return null;
      const editorDom = this.editor?.view?.dom;
      if (!editorDom) return null;
      const editorRect = editorDom.getBoundingClientRect();
      return {
        height: Math.max(rangeRect.height, MIN_GUTTER_ITEM_HEIGHT),
        top: rangeRect.top - editorRect.top + editorDom.scrollTop,
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
