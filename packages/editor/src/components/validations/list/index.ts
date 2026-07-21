import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@/components/validations/validation-item';
import type { ValidationItem } from '@/components/validations/validation-item';
import type { ValidationsMap, ValidationSeverity } from '@/types/validation';
import { validationsContext } from '@/context/validationsContext';
import { CustomEvents, type FocusValidationItemInListEvent } from '@/events';
import { type ValidationKey, validationMessages } from '@/messages';
import listStyles from './styles';

const tag = 'clippy-validations-list';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationsList;
  }
}

/**
 * Renders the current accessibility validations as a list of
 * `<clippy-validation-item>` elements, optionally filtered by severity or a
 * focused validation group. Listens to the global
 * `CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST` event to scroll and focus the
 * matching item.
 *
 * @tag clippy-validations-list
 *
 * @example
 * ```html
 * <clippy-validations-list></clippy-validations-list>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ValidationsList extends LitElement {
  static override readonly styles = [listStyles, unsafeCSS(paragraphStyle)];

  /** @internal Consumed from the nearest {@link validationsContext} provider. */
  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  /** Optional severity filter. When set, only items of this severity are rendered. */
  @property({ type: String }) severity: ValidationSeverity | null = null;

  /**
   * Optional focused-group filter. When set, only validations whose range is in
   * this list are rendered (used to show a single clicked validation and any
   * that overlap it). Takes precedence over {@link severity}.
   */
  @property({ attribute: false }) focusedValidationGroup: Range[] | null = null;

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, this.#handleFocusValidationItem);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, this.#handleFocusValidationItem);
  }

  readonly #handleFocusValidationItem = (event: Event) => {
    const { range } = (event as FocusValidationItemInListEvent).detail;

    const items = this.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).range === range);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (match as ValidationItem).focus();
    }
  };

  override render() {
    const entries = [...(this.validationsContext?.entries() ?? [])].filter(([range, { severity }]) => {
      if (this.focusedValidationGroup) return this.focusedValidationGroup.includes(range);
      return !this.severity || severity === this.severity;
    });

    if (entries.length === 0) {
      const emptyMessage = msg(str`No validation issues found`);
      return html`<p class="nl-paragraph">${emptyMessage}</p>`;
    }

    return html`
      <ul class="clippy-validations-list" role="list">
        ${map(entries, ([, { correct, range, severity, tipPayload, validatorKey }]) => {
          const valKey = validatorKey as ValidationKey;
          const { customCorrectLabel, description, href, tip } = validationMessages()[valKey];
          const tipHtml = tip?.(tipPayload) ?? null;
          return html`
            <li class="clippy-validations-list__item">
              <clippy-validation-item
                .range=${range}
                .severity=${severity}
                .description=${description}
                .href=${href}
                .customCorrectLabel=${customCorrectLabel}
                .correct=${correct}
              >
                ${tipHtml ? html`<p class="nl-paragraph" slot="tip-html">${tipHtml}</p>` : nothing}
              </clippy-validation-item>
            </li>
          `;
        })}
      </ul>
    `;
  }
}
