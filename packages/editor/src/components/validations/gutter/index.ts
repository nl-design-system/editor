import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { validationSeverity, type ValidationSeverity } from '@nl-design-system-community/clippy-a11y-validator';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import { html, LitElement, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationInteractionMode, Violation, ViolationsMap } from '@/types/validation';
import { validationInteractionMode } from '@/constants';
import { identifierContext } from '@/context/identifierContext';
import { tiptapContext } from '@/context/tiptapContext';
import { violationsContext } from '@/context/violationsContext';
import { ResizeController } from '@/controllers/ResizeController';
import {
  CustomEvents,
  type FocusValidationItemInGutterEvent,
  type FocusValidationItemInListDetail,
  type OpenValidationGroupDetail,
} from '@/events';
import { localizeHost } from '@/localization';
import {
  applyHoverHighlight,
  applyValidationHighlights,
  clearHoverHighlight,
  clearValidationHighlights,
} from '@/utils/highlights';
import { getOverlappingRanges } from '@/utils/ranges';
import gutterStyles from './styles';

const tag = 'clippy-validations-gutter';
const MIN_GUTTER_ITEM_HEIGHT = 8;

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Gutter;
  }
}

const SEVERITY_RANK: Record<ValidationSeverity, number> = {
  [validationSeverity.ERROR]: 2,
  [validationSeverity.INFO]: 0,
  [validationSeverity.WARNING]: 1,
};

const severityIcon = (severity: ValidationSeverity): string => {
  switch (severity) {
    case validationSeverity.ERROR:
      return AlertTriangleIcon;
    case validationSeverity.WARNING:
      return AlertCircleIcon;
    default:
      return InfoCircleIcon;
  }
};

type PositionedIndicator = {
  position: { top: number; height: number };
  range: Range;
  violation: Violation;
};

/** Browsers without `focusgroup` get a roving tabindex instead. */
const supportsFocusgroup = (): boolean => 'focusGroup' in HTMLElement.prototype;

const toggleCountByRange = (indicators: PositionedIndicator[]): Map<Range, number> => {
  const lines = new Map<number, PositionedIndicator[]>();
  for (const indicator of indicators) {
    const top = Math.floor(indicator.position.top);
    const line = lines.get(top);
    if (line) {
      line.push(indicator);
    } else {
      lines.set(top, [indicator]);
    }
  }

  const counts = new Map<Range, number>();
  for (const line of lines.values()) {
    const lead = line.reduce(
      (best, current) =>
        SEVERITY_RANK[current.violation.severity] > SEVERITY_RANK[best.violation.severity] ? current : best,
      line[0],
    );
    counts.set(lead.range, line.length);
  }
  return counts;
};

/**
 * Side gutter that displays colour-coded accessibility validation indicators
 * vertically aligned with their corresponding positions in the editor content.
 * Clicking a toggle either scrolls the external validations list to the
 * matching item or opens the matching validation(s) in the drawer, depending on
 * `mode`.
 *
 * @tag clippy-validations-gutter
 *
 * @fires {FocusValidationItemInListEvent} FOCUS_VALIDATION_ITEM_IN_LIST - Dispatched in `list` mode
 *   when the user clicks a toggle, so the list component can scroll to it.
 * @fires {OpenValidationGroupEvent} OPEN_VALIDATION_GROUP - Dispatched in `drawer` mode
 *   when the user clicks a toggle, so the drawer can show that validation
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
  static override readonly styles = [gutterStyles, unsafeCSS(paragraphStyle), unsafeCSS(numberBadgeStyles)];

  /**
   * Display mode for validation interactions.
   * - `list` – scroll the external validations list to the item on click.
   * - `drawer` – open the clicked validation (plus any overlapping ones) in the
   *   validations drawer on click.
   * - `readonly` – toggles are visible and focusable, but clicking them performs no action (default).
   */
  @property({ type: String })
  mode: ValidationInteractionMode = validationInteractionMode.READONLY;

  /**
   * Optional reference element used for indicator positioning and resize
   * observation when no TipTap editor context is available (standalone use).
   * Pass the element that wraps the content being validated.
   */
  @property({ attribute: false })
  contentElement?: HTMLElement;

  /**
   * Overlay `contentElement` without a positioned wrapper: the gutter aligns its
   * own box to the content's box and re-aligns when the page lays out again.
   */
  @property({ reflect: true, type: Boolean })
  overlay = false;

  /** Whether the toggles are in the tab order. */
  @property({ attribute: false })
  tabbable = true;

  /** @internal */
  @state()
  private activeRange: Range | null = null;

  /** @internal The line whose button is the gutter's tab stop, without `focusgroup` support. */
  @state()
  private focusedRange: Range | null = null;

  #tabStop?: Range;

  /** @internal Consumed from the nearest {@link tiptapContext} provider. */
  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  private readonly editor?: Editor;

  /** Map of DOM ranges to their violations, used to render indicators. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  @consume({ context: violationsContext, subscribe: true })
  @state()
  private readonly violationsContext?: ViolationsMap;

  /** @internal Identifier of the owning editor, used to scope drawer events. */
  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifierContextValue?: string;

  /** Standalone identifier for use outside `<clippy-context>` */
  @property({ attribute: false })
  identifier?: string;

  /** Coalesced identifier: standalone prop wins, else the consumed context. */
  get #identifier(): string | undefined {
    return this.identifier ?? this.identifierContextValue;
  }

  readonly #closeValidationItem = () => {
    this.activeRange = null;
  };

  readonly #resizeController = new ResizeController(this);

  #handleToggleClick(range: Range) {
    if (this.mode === validationInteractionMode.LIST) {
      this.dispatchEvent(
        new CustomEvent<FocusValidationItemInListDetail>(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, {
          bubbles: true,
          composed: true,
          detail: { range },
        }),
      );
    } else if (this.mode === validationInteractionMode.DRAWER) {
      globalThis.dispatchEvent(
        new CustomEvent<OpenValidationGroupDetail>(CustomEvents.OPEN_VALIDATION_GROUP, {
          detail: { identifier: this.#identifier, ranges: this.#getOverlappingRanges(range) },
        }),
      );
    }
    // `readonly`: the toggle is a focusable button, but clicking it performs no action.
  }

  /** The clicked range plus every other validation range that overlaps it. */
  #getOverlappingRanges(target: Range): Range[] {
    const map = this.violationsMap ?? this.violationsContext;
    if (!map) return [target];
    return getOverlappingRanges(target, map.keys());
  }

  readonly #handleFocusValidationItemInGutter = (event: Event) => {
    const { range } = (event as FocusValidationItemInGutterEvent).detail;
    this.activeRange = this.activeRange === range ? null : range;
  };

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
    if (this.hasUpdated) {
      this.#observeContent();
      this.requestUpdate();
    }
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, this.#handleFocusValidationItemInGutter);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#closeValidationItem);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeValidationItem);
  }

  override firstUpdated(): void {
    // With no TipTap editor (readonly consumers skip TipTap entirely) and no
    // explicit `contentElement`, nothing else attaches a ResizeObserver. Observe
    // the host itself: its `block-size: 100%` tracks the validated content's
    // height, so reflows from resizing or opening the drawer fire the observer
    // and recompute indicator positions.
    if (!this.editor && !this.contentElement) {
      this.#resizeController.observe(this);
    }
  }

  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    if (this.overlay && this.contentElement && this.isConnected) {
      this.#alignTo(this.contentElement);
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('violationsMap') || changedProperties.has('violationsContext')) {
      applyValidationHighlights(this, this.violationsMap ?? this.violationsContext);
    }

    if (changedProperties.has('editor')) {
      this.#handleEditorChanged(changedProperties.get('editor'));
    }

    if (changedProperties.has('contentElement') || (changedProperties.has('overlay') && this.contentElement)) {
      if (this.contentElement) {
        this.#observeContent();
      } else if (!this.editor?.view?.dom) {
        this.#resizeController.disconnect();
      }
    }
  }

  #observeContent(): void {
    if (!this.contentElement) return;
    if (this.overlay) {
      this.#resizeController.observe(this.contentElement, document.body);
    } else {
      this.#resizeController.observe(this.contentElement);
    }
  }

  #alignTo(content: HTMLElement): void {
    const box = content.getBoundingClientRect();
    Object.assign(this.style, {
      blockSize: `${box.height}px`,
      inlineSize: `${box.width}px`,
      insetBlockStart: this.style.insetBlockStart || '0px',
      insetInlineStart: this.style.insetInlineStart || '0px',
      margin: '0',
      position: 'absolute',
    });
    this.style.setProperty('--_clippy-gutter-inline-space', `${Math.max(box.left, 0)}px`);
    const host = this.getBoundingClientRect();
    this.style.insetInlineStart = `${Number.parseFloat(this.style.insetInlineStart) + box.left - host.left}px`;
    this.style.insetBlockStart = `${Number.parseFloat(this.style.insetBlockStart) + box.top - host.top}px`;
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
    clearHoverHighlight();
    clearValidationHighlights(this);
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

  #tabIndexFor(range: Range) {
    if (!this.tabbable) return '-1';
    if (supportsFocusgroup()) return nothing;
    return range === this.#tabStop ? '0' : '-1';
  }

  readonly #handleKeydown = (event: KeyboardEvent) => {
    if (supportsFocusgroup()) return;
    const buttons = [...this.renderRoot.querySelectorAll<HTMLButtonElement>('.clippy-validations-gutter__toggle')];
    const current = buttons.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const target = {
      ArrowDown: Math.min(current + 1, buttons.length - 1),
      ArrowUp: Math.max(current - 1, 0),
      End: buttons.length - 1,
      Home: 0,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    buttons[target].focus();
  };

  #highlightRange(range: Range, violation: Violation): void {
    if (violation.display !== 'inline') return;
    applyHoverHighlight(violation.severity, range);
  }

  #renderToggle(range: Range, violation: Violation, count: number) {
    const { severity } = violation;
    return html`<div class="clippy-validations-gutter__toggle-anchor">
      <button
        class="clippy-validations-gutter__toggle clippy-validations-gutter__toggle--${severity}"
        aria-label=${count > 1 ? msg(str`Open ${count} validations on this line`) : msg('Open validation')}
        tabindex=${this.#tabIndexFor(range)}
        @click=${() => this.#handleToggleClick(range)}
        @mouseenter=${() => this.#highlightRange(range, violation)}
        @mouseleave=${() => clearHoverHighlight()}
        @focus=${() => {
          this.focusedRange = range;
          this.#highlightRange(range, violation);
        }}
        @blur=${() => clearHoverHighlight()}
      >
        ${
          count > 1
            ? html`<span
                class="nl-number-badge clippy-validations-gutter__badge clippy-validations-gutter__badge--${severity}"
                aria-hidden="true"
                >${count}</span
              >`
            : nothing
        }
        <span class="clippy-validations-gutter__icon" aria-hidden="true">${unsafeSVG(severityIcon(severity))}</span>
      </button>
    </div>`;
  }

  #renderIndicator(
    range: Range,
    violation: Violation,
    position: { top: number; height: number },
    toggleCount: number | undefined,
  ) {
    const { correction, display, messages, severity } = violation;
    const { explanation, href, solution, title: heading } = messages;
    const isActive = this.activeRange === range;
    return html`<li
      class="clippy-validations-gutter__indicator"
      data-display=${display}
      data-severity=${severity}
      style=${styleMap({ 'block-size': `${position.height}px`, 'inset-block-start': `${position.top}px` })}
    >
      <span
        class="${classMap({
          [`clippy-validations-gutter__flag--${severity}`]: true,
          'clippy-validations-gutter__flag': true,
          'clippy-validations-gutter__flag--active': isActive,
        })}"
        aria-hidden="true"
      ></span>
      ${toggleCount === undefined ? nothing : this.#renderToggle(range, violation, toggleCount)}
      <div
        class="${classMap({
          'clippy-validations-gutter__tooltip': true,
          'clippy-validations-gutter__tooltip--active': isActive,
        })}"
      >
        <clippy-validation-item
          .mode=${this.mode}
          .range=${range}
          .severity=${severity}
          .heading=${heading}
          .explanation=${explanation}
          .solution=${solution}
          .href=${href}
          .correction=${correction}
        ></clippy-validation-item>
      </div>
    </li>`;
  }

  override render() {
    const map = this.violationsMap ?? this.violationsContext;
    if (!map || map.size === 0) {
      return nothing;
    }

    const indicators = [...map.entries()]
      .filter(([range]) => range !== undefined)
      .map(([range, violation]) => ({ position: this.#getIndicatorPosition(range), range, violation }))
      .filter((indicator): indicator is PositionedIndicator => indicator.position !== null)
      .sort((a, b) => a.position.top - b.position.top);

    const toggleCounts = toggleCountByRange(indicators);
    const stops = indicators.filter(({ range }) => toggleCounts.has(range)).map(({ range }) => range);
    this.#tabStop = this.focusedRange && stops.includes(this.focusedRange) ? this.focusedRange : stops[0];

    return html`
      <ol
        class="clippy-validations-gutter__list"
        aria-label=${msg('Validations gutter')}
        focusgroup=${supportsFocusgroup() ? 'toolbar block' : nothing}
        data-testid="clippy-validations-gutter"
        @keydown=${this.#handleKeydown}
      >
        ${indicators.map(({ position, range, violation }) =>
          this.#renderIndicator(range, violation, position, toggleCounts.get(range)),
        )}
      </ol>
    `;
  }
}
