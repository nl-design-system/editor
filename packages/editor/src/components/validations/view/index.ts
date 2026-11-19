import type { ValidationSeverity } from '@nl-design-system-community/clippy-a11y-validator';
import { localized, msg } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, nothing, unsafeCSS, type PropertyValues } from 'lit';
import '@/components/validations/list';
import { property, state } from 'lit/decorators.js';
import type { ValidationItem } from '@/components/validations/validation-item';
import type { ViolationsMap } from '@/types/validation';
import '@/components/validation-filters';
import '@nl-design-system-community/clippy-components/clippy-button';
import { CustomEvents, type FilterChangeEvent, type FocusNodeEvent } from '@/events';
import { localizeHost } from '@/localization';
import validationsViewStyles from './styles';

const tag = 'clippy-validations-view';

const NO_VIOLATIONS: ViolationsMap = new Map();

/**
 * Lists the accessibility violations of a Clippy hub, which shows it in its drawer.
 *
 * @tag clippy-validations-view
 *
 * @fires {CustomEvent} FILTER_CHANGE - Listens to filter the displayed validations
 *   by severity.
 *
 * @example
 * ```html
 * <clippy-sidebar>
 *   <clippy-validations-view></clippy-validations-view>
 * </clippy-sidebar>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ValidationsView extends LitElement {
  static override readonly styles = [validationsViewStyles, unsafeCSS(numberBadgeStyles), unsafeCSS(paragraphStyle)];

  @state()
  private selectedSeverity: ValidationSeverity | null = null;

  /**
   * When set, the view shows only these validation ranges — a clicked gutter
   * item plus any validations whose range intersects it (they share content, so
   * their indicators sit on the same spot) — and hides the severity filters.
   * `null` means the full, filterable list is shown.
   */
  @property({ attribute: false })
  focusedValidationGroup: Range[] | null = null;

  /** The violations to list, pushed by a Clippy hub. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  /** @see {@link violationsMap} */
  @property({ attribute: false })
  identifier?: string;

  /** The name of the view. */
  get label(): string {
    return msg('Errors, warnings or tips');
  }

  get #violations(): ViolationsMap {
    return this.violationsMap ?? NO_VIOLATIONS;
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('focusedValidationGroup') && this.focusedValidationGroup) this.selectedSeverity = null;
  }

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
    globalThis.addEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#focusValidationItem);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#focusValidationItem);
    super.disconnectedCallback();
  }

  // Clears the focused group so the full, filterable validation list is shown.
  readonly #showAllValidations = () => {
    this.focusedValidationGroup = null;
  };

  readonly #focusNode = (event: Event) => {
    const { range } = (event as FocusNodeEvent).detail;
    if (!range) return;

    const selection = globalThis.getSelection();
    if (selection) {
      selection.collapse(range.startContainer, range.startOffset);
    }
  };

  readonly #focusValidationItem = async (event: CustomEventInit<{ range: Range; identifier: string }>) => {
    const { identifier, range } = event.detail || {};
    if (!range || identifier !== this.identifier) return;

    await this.updateComplete;

    const listEl = this.shadowRoot?.querySelector('clippy-validations-list');
    const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).range === range);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (match as ValidationItem).focus();
    }
  };

  readonly #handleFilterChange = (event: Event) => {
    const { identifier, severity } = (event as FilterChangeEvent).detail;
    if (identifier !== this.identifier) return;

    this.selectedSeverity = (severity as ValidationSeverity) || null;
  };

  /** Whether the view is focused on a single validation group. */
  get #hasFocusedValidationGroup(): boolean {
    return this.focusedValidationGroup !== null;
  }

  /** Severity applied to the list; suppressed while a focused group is shown. */
  get #listSeverity(): ValidationSeverity | null {
    if (this.#hasFocusedValidationGroup) return null;
    return this.selectedSeverity;
  }

  /** "Show all validations" button, rendered only while a group is focused. */
  #renderShowAllButton() {
    if (!this.#hasFocusedValidationGroup) return nothing;
    return html`<clippy-button
      class="clippy-validations-view__show-all"
      purpose="secondary"
      size="small"
      @click=${this.#showAllValidations}
    >
      ${msg('Show all validations')}
    </clippy-button>`;
  }

  override render() {
    const violations = this.#violations;
    return html`
      <div class="clippy-validations-view__filters">
        <clippy-validation-filters
          .identifier=${this.identifier}
          .violationsMap=${violations}
          ?hidden=${this.#hasFocusedValidationGroup}
        ></clippy-validation-filters>
        ${this.#renderShowAllButton()}
      </div>
      <div role="region" aria-label=${msg('Validations')}>
        <clippy-validations-list
          .identifier=${this.identifier}
          .violationsMap=${violations}
          .severity=${this.#listSeverity}
          .focusedValidationGroup=${this.focusedValidationGroup}
        ></clippy-validations-list>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationsView;
  }
}
