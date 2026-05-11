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
import gutterStyles from './styles.ts';

const tag = 'clippy-validations-gutter';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Gutter;
  }
}

const SEVERITY_ORDER: Record<ValidationSeverity, number> = { error: 2, warning: 1, info: 0 };

const severityIcon = (severity: ValidationSeverity) => {
  switch (severity) {
    case 'error': return AlertTriangleIcon;
    case 'warning': return AlertCircleIcon;
    default: return InfoCircleIcon;
  }
};

/** Group validation entries by their vertical position (boundingBox.top). */
const groupByTop = (
  entries: [string, ValidationResult][],
): Map<number, [string, ValidationResult][]> => {
  const groups = new Map<number, [string, ValidationResult][]>();
  for (const entry of entries) {
    const top = entry[1].boundingBox?.top ?? -1;
    if (!groups.has(top)) groups.set(top, []);
    groups.get(top)!.push(entry);
  }
  return groups;
};

/** Pick the entry with the highest severity from a group. */
const highestSeverityEntry = (group: [string, ValidationResult][]): [string, ValidationResult] =>
  group.reduce((best, cur) =>
    SEVERITY_ORDER[cur[1].severity] > SEVERITY_ORDER[best[1].severity] ? cur : best,
  );

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

    const sortedValidations = [...this.validationsContext.entries()]
      .filter(([, { boundingBox }]) => boundingBox != null)
      .sort(([, a], [, b]) => a.pos - b.pos);

    const groups = groupByTop(sortedValidations);

    return html`
      <ol class="clippy-validations-gutter__list" role="list" data-testid="clippy-validations-gutter">
        ${[...groups.entries()].map(([, group]) => {
          const [key, { boundingBox, range, scope, severity }] = highestSeverityEntry(group);
          if (!boundingBox) return nothing;
          const validationKey = key.split('_')[0] as ValidationKey;
          const { description } = validationMessages()[validationKey];
          const isActive = this.activeValidationItemKey === key;
          const count = group.length;

          return html`<li
            class="clippy-validations-gutter__indicator"
            data-severity=${severity}
            style="inset-block-start: ${boundingBox.top}px; block-size: ${boundingBox.height}px"
          >
            <button
              class="${classMap({
                [`clippy-validations-gutter__toggle--${severity}`]: true,
                'clippy-validations-gutter__toggle': true,
                'clippy-validations-gutter__toggle--active': isActive,
              })}"
              aria-expanded=${isActive ? 'true' : 'false'}
              aria-label=${description}
              @click=${() => this.#handleIndicatorClick(key)}
              @mouseenter=${() => { if (scope === 'inline' && range) applyHoverHighlight(severity, range); }}
              @mouseleave=${() => clearHoverHighlight()}
            ></button>
            <button
              class="clippy-validations-gutter__meta clippy-validations-gutter__meta--${severity}"
              aria-label=${msg(str`Open validation panel`)}
              @click=${() => this.dispatchEvent(new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, { bubbles: true, composed: true }))}
            >
              ${count > 1 ? html`<span
                class="nl-number-badge clippy-validations-gutter__badge--${severity}"
                aria-label=${msg(str`${count} validation items`)}
              >${count}</span>` : nothing}
              <span class="clippy-validations-gutter__icon" aria-hidden="true">
                ${unsafeSVG(severityIcon(severity))}
              </span>
            </button>
          </li>`;
        })}
      </ol>
    `;
  }
}
