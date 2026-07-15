import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { ValidationResult, ValidationsMap } from '@/types/validation';
import { identifierContext } from '@/context/identifierContext';
import { tiptapContext } from '@/context/tiptapContext';
import { validationsContext } from '@/context/validationsContext';
import { ResizeController } from '@/controllers/ResizeController';
import {
  CustomEvents,
  type FocusValidationItemInGutterEvent,
  type FocusValidationItemInListDetail,
  type OpenValidationGroupDetail,
} from '@/events';
import { type ValidationKey, validationMessages } from '@/messages';
import gutterStyles from './styles';

const tag = 'clippy-validations-gutter';
const MIN_GUTTER_ITEM_HEIGHT = 8;

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Gutter;
  }
}

/**
 * Side gutter that displays colour-coded accessibility validation indicators
 * vertically aligned with their corresponding positions in the editor content.
 * Clicking an indicator either scrolls the external validations list to the
 * matching item or opens the matching validation(s) in the drawer, depending on
 * `mode`.
 *
 * @tag clippy-validations-gutter
 *
 * @fires {FocusValidationItemInListEvent} FOCUS_VALIDATION_ITEM_IN_LIST - Dispatched in `list` mode
 *   when the user clicks an indicator, so the list component can scroll to it.
 * @fires {OpenValidationGroupEvent} OPEN_VALIDATION_GROUP - Dispatched in `drawer` mode
 *   when the user clicks an indicator, so the drawer can show that validation
 *   and any overlapping ones.
 *
 * @example
 * ```html
 * <clippy-validations-gutter></clippy-validations-gutter>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles, unsafeCSS(paragraphStyle)];

  /**
   * Display mode for validation interactions.
   * - `list` – scroll the external validations list to the item on click.
   * - `drawer` – open the clicked validation (plus any overlapping ones) in the
   *   validations drawer on click.
   * - `readonly` – indicators are visible but not interactive (default).
   */
  @property({ type: String })
  mode: 'list' | 'drawer' | 'readonly' = 'readonly';

  /**
   * Optional reference element used for indicator positioning and resize
   * observation when no TipTap editor context is available (standalone use).
   * Pass the element that wraps the content being validated.
   */
  @property({ attribute: false })
  contentElement?: HTMLElement;

  /** @internal */
  @state()
  private activeRange: Range | null = null;

  /** @internal Consumed from the nearest {@link tiptapContext} provider. */
  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  private readonly editor?: Editor;

  /** Map of DOM ranges to their validation results, used to render indicators. */
  @property({ attribute: false })
  validationsMap?: ValidationsMap;

  @consume({ context: validationsContext, subscribe: true })
  @state()
  private readonly validationsContext?: ValidationsMap;

  /** @internal Identifier of the owning editor, used to scope drawer events. */
  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

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
    } else if (this.mode === 'drawer') {
      globalThis.dispatchEvent(
        new CustomEvent<OpenValidationGroupDetail>(CustomEvents.OPEN_VALIDATION_GROUP, {
          detail: { identifier: this.identifier, ranges: this.#getOverlappingRanges(range) },
        }),
      );
    }
    // `readonly`: indicators are not interactive on click.
  }

  /** Whether two ranges share any content (overlap) within the same document. */
  #rangesIntersect(a: Range, b: Range): boolean {
    try {
      return a.compareBoundaryPoints(Range.END_TO_START, b) < 0 && a.compareBoundaryPoints(Range.START_TO_END, b) > 0;
    } catch {
      return false;
    }
  }

  /** The clicked range plus every other validation range that overlaps it. */
  #getOverlappingRanges(target: Range): Range[] {
    const map = this.validationsMap ?? this.validationsContext;
    if (!map) return [target];
    const group = [...map.keys()].filter((range) => range === target || this.#rangesIntersect(target, range));
    return group.length ? group : [target];
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

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('editor')) {
      this.#handleEditorChanged(changedProperties.get('editor'));
    }

    if (changedProperties.has('contentElement')) {
      if (this.contentElement) {
        this.#resizeController.observe(this.contentElement);
      } else if (!this.editor?.view?.dom) {
        this.#resizeController.disconnect();
      }
    }
  }

  #handleEditorChanged(previousEditor: Editor | undefined): void {
    if (!this.contentElement) {
      this.#resizeController.disconnect();
    }
    previousEditor?.off('create', this.#attachResizeObserver);

    if (!this.editor) return;

    // editor.view is a getter that throws in TipTap 3.x when not yet mounted.
    let editorDom: HTMLElement | null = null;
    try {
      editorDom = this.editor.view?.dom ?? null;
    } catch {
      // Not mounted yet — will wait for the 'create' event.
    }
    if (editorDom) {
      this.#attachResizeObserver();
    } else {
      this.editor.on('create', this.#attachResizeObserver);
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

  #renderIndicator(
    range: Range,
    correct: ValidationResult['correct'],
    severity: ValidationResult['severity'],
    tipPayload: ValidationResult['tipPayload'],
    validatorKey: ValidationResult['validatorKey'],
  ) {
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
  }

  override render() {
    const map = this.validationsMap ?? this.validationsContext;
    if (!map || map.size === 0) {
      return nothing;
    }

    return html`
      <ol class="clippy-validations-gutter__list" role="list" data-testid="clippy-validations-gutter">
        ${[...map.entries()]
          .filter(([range]) => range !== undefined)
          .map(([range, { correct, severity, tipPayload, validatorKey }]) =>
            this.#renderIndicator(range, correct, severity, tipPayload, validatorKey),
          )}
      </ol>
    `;
  }
}
