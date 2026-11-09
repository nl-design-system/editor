import type { ValidationSeverity } from '@nl-design-system-community/clippy-a11y-validator';
import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import '@/components/validations/validation-item';
import { map } from 'lit/directives/map.js';
import type { ValidationItem } from '@/components/validations/validation-item';
import type { ViolationsMap } from '@/types/validation';
import { identifierContext } from '@/context/identifierContext';
import { violationsContext } from '@/context/violationsContext';
import { CustomEvents, type FocusValidationItemInListEvent } from '@/events';
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

  /** The violations to list, pushed by the Drawer. Falls back to the consumed context when unset. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  /** Identifier of the Clippy hub, passed on to every item. Falls back to the consumed context when unset. */
  @property({ attribute: false })
  identifier?: string;

  @consume({ context: violationsContext, subscribe: true })
  @state()
  private readonly violationsContextValue?: ViolationsMap;

  @consume({ context: identifierContext, subscribe: true })
  @state()
  private readonly identifierContextValue?: string;

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
    const violations = this.violationsMap ?? this.violationsContextValue;
    const entries = [...(violations?.entries() ?? [])].filter(([range, { severity }]) => {
      if (this.focusedValidationGroup) return this.focusedValidationGroup.includes(range);
      return !this.severity || severity === this.severity;
    });

    if (entries.length === 0) {
      const emptyMessage = msg(str`No validation issues found`);
      return html`<p class="nl-paragraph">${emptyMessage}</p>`;
    }

    return html`
      <ul class="clippy-validations-list" role="list">
        ${map(entries, ([, { correction, messages, range, severity }]) => {
          const { explanation, href, solution, title: heading } = messages;
          return html`
            <li class="clippy-validations-list__item">
              <clippy-validation-item
                .identifier=${this.identifier ?? this.identifierContextValue}
                .range=${range}
                .severity=${severity}
                .heading=${heading}
                .explanation=${explanation}
                .solution=${solution}
                .href=${href}
                .correction=${correction}
              ></clippy-validation-item>
            </li>
          `;
        })}
      </ul>
    `;
  }
}
