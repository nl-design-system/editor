import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationResult, ValidationSeverity, ValidationsMap } from '@/types/validation.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import { type ValidationKey, validationMessages } from '@/messages';
import { applyHoverHighlight, clearHoverHighlight } from '@/utils/highlights.ts';
import { MIN_GUTTER_ITEM_HEIGHT } from '@/validators/helpers.ts';
import gutterStyles from './styles.ts';

const tag = 'clippy-validations-gutter';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Gutter;
  }
}

const SEVERITY_ORDER: Record<ValidationSeverity, number> = { error: 2, info: 0, warning: 1 };

const severityIcon = (severity: ValidationSeverity) => {
  switch (severity) {
    case 'error':
      return AlertTriangleIcon;
    case 'warning':
      return AlertCircleIcon;
    default:
      return InfoCircleIcon;
  }
};

type PositionedEntry = [key: string, result: ValidationResult, box: { top: number; height: number }];

/**
 * Compare two ValidationResults by their Range start position in the document.
 * Results without a range sort to the end.
 */
const compareByRange = (a: ValidationResult, b: ValidationResult): number => {
  if (!a.range && !b.range) return 0;
  if (!a.range) return 1;
  if (!b.range) return -1;
  try {
    return a.range.compareBoundaryPoints(Range.START_TO_START, b.range);
  } catch {
    return 0;
  }
};

/** Pick the entry with the highest severity from a group. */
const highestSeverityEntry = (group: PositionedEntry[]): PositionedEntry => {
  return group.reduce((best, cur) => {
    if (SEVERITY_ORDER[cur[1].severity] > SEVERITY_ORDER[best[1].severity]) {
      return cur;
    }
    return best;
  }, group[0]);
};

@localized()
@safeCustomElement(tag)
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles, unsafeCSS(paragraphStyle), unsafeCSS(numberBadgeStyles)];

  @property({ type: String })
  mode: 'tooltip' | 'list' | 'readonly' = 'tooltip';

  @state()
  private activeValidationItemKey: string | null = null;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  readonly #closeValidationItem = () => {
    this.activeValidationItemKey = null;
  };

  #handleIndicatorClick(key: string) {
    if (this.mode === 'list') {
      this.dispatchEvent(
        new CustomEvent(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, { bubbles: true, composed: true, detail: { key } }),
      );
    } else {
      this.activeValidationItemKey = this.activeValidationItemKey === key ? null : key;
    }
  }

  readonly #handleFocusValidationItemInGutter = (event: Event) => {
    const { key } = (event as CustomEvent<{ key: string }>).detail;
    this.activeValidationItemKey = this.activeValidationItemKey === key ? null : key;
  };

  /**
   * Compute the gutter-relative top offset and height for a Range.
   * Uses `getBoundingClientRect()` on both the range and the gutter host element
   * so positioning is derived purely from HTML layout — no TipTap node positions.
   */
  #getPositionFromRange(range: Range): { top: number; height: number } | null {
    const rect = range.getBoundingClientRect();
    // Guard against collapsed/detached ranges
    if (rect.height === 0 && rect.width === 0) return null;
    const gutterRect = this.getBoundingClientRect();
    return {
      height: Math.max(rect.height, MIN_GUTTER_ITEM_HEIGHT),
      top: rect.top - gutterRect.top,
    };
  }

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, this.#handleFocusValidationItemInGutter);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#closeValidationItem);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeValidationItem);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.removeEventListener(
      CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER,
      this.#handleFocusValidationItemInGutter,
    );
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#closeValidationItem);
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeValidationItem);
  }

  override render() {
    if (!this.validationsContext || this.validationsContext.size === 0) {
      return nothing;
    }

    // Sort by document order (pos) then compute gutter positions from ranges
    const sortedValidations = [...this.validationsContext.entries()]
      .filter(([, { range }]) => range !== null)
      .sort(([, a], [, b]) => compareByRange(a, b));

    // Compute top/height for each entry using its Range, group by rounded top
    type PositionedEntry = [key: string, result: ValidationResult, box: { top: number; height: number }];
    const groups = new Map<number, PositionedEntry[]>();
    for (const [key, result] of sortedValidations) {
      if (!result.range) continue;
      const box = this.#getPositionFromRange(result.range);
      if (!box) continue;
      const roundedTop = Math.round(box.top);
      if (!groups.has(roundedTop)) groups.set(roundedTop, []);
      groups.get(roundedTop)!.push([key, result, box]);
    }

    return html`
      <ol class="clippy-validations-gutter__list" role="list" data-testid="clippy-validations-gutter">
        ${[...groups.entries()].map(([, group]) => {
          const [key, { correct, range, scope, severity, tipPayload }, repBox] = highestSeverityEntry(group);
          const repRange = group.find(([k]) => k === key)![1].range;
          const validationKey = key.split('_')[0] as ValidationKey;
          const { customCorrectLabel, description, href, tip } = validationMessages()[validationKey];
          const tipHtml = tip?.(tipPayload) ?? null;
          const isActive = this.activeValidationItemKey === key;
          const count = group.length;

          return html`<li
            class="clippy-validations-gutter__indicator"
            data-severity=${severity}
            style="inset-block-start: ${repBox.top}px; block-size: ${repBox.height}px"
          >
            <div
              class="${classMap({
                [`clippy-validations-gutter__toggle--${severity}`]: true,
                'clippy-validations-gutter__toggle': true,
                'clippy-validations-gutter__toggle--active': isActive,
              })}"
              aria-expanded=${isActive ? 'true' : 'false'}
              aria-label=${description}
              @mouseenter=${() => {
                if (scope === 'inline' && repRange) applyHoverHighlight(severity, repRange);
              }}
              @mouseleave=${() => clearHoverHighlight()}
            ></div>
            <div class="clippy-validations-gutter__meta-anchor">
              <button
                class="clippy-validations-gutter__meta clippy-validations-gutter__meta--${severity}"
                aria-label=${msg(str`Open validation panel`)}
                @click=${() => this.#handleIndicatorClick(key)}
              >
                ${count > 1
                  ? html`<span
                      class="nl-number-badge clippy-validations-gutter__badge--${severity}"
                      aria-label=${msg(str`${count} validation items`)}
                      >${count}</span
                    >`
                  : nothing}
                <span class="clippy-validations-gutter__icon" aria-hidden="true">
                  ${unsafeSVG(severityIcon(severity))}
                </span>
              </button>
              <div
                class="${classMap({
                  'clippy-validation-gutter__tooltip': true,
                  'clippy-validation-gutter__tooltip--active': isActive,
                })}"
              >
                <clippy-validation-item
                  .key=${key}
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
            </div>
          </li>`;
        })}
      </ol>
    `;
  }
}
