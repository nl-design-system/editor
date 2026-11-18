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
import { hideSidebarView, showSidebarView, type SidebarView } from '@/components/sidebar';
import sidebarViewStyles from '@/components/sidebar/viewStyles';
import {
  CustomEvents,
  type CorrectValidationIssueEvent,
  type FilterChangeEvent,
  type FocusNodeEvent,
  type OpenDocumentOverviewEvent,
  type OpenValidationGroupEvent,
} from '@/events';
import { localizeHost } from '@/localization';
import validationsViewStyles from './styles';

const tag = 'clippy-validations-view';

const NO_VIOLATIONS: ViolationsMap = new Map();

/**
 * View of a `clippy-sidebar` that lists all accessibility violations of a Clippy hub. Shows on
 * the global `CustomEvents.OPEN_DOCUMENT_OVERVIEW` event for the `validations` mode, and on
 * `CustomEvents.OPEN_VALIDATION_GROUP`, scoped to the hub identifier.
 *
 * @tag clippy-validations-view
 *
 * @fires {OpenDocumentOverviewEvent} OPEN_DOCUMENT_OVERVIEW - Listens for this event to open.
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
export class ValidationsView extends LitElement implements SidebarView {
  static override readonly styles = [
    sidebarViewStyles,
    validationsViewStyles,
    unsafeCSS(numberBadgeStyles),
    unsafeCSS(paragraphStyle),
  ];

  @state()
  private selectedSeverity: ValidationSeverity | null = null;

  /**
   * When set, the view shows only these validation ranges — a clicked gutter
   * item plus any validations whose range intersects it (they share content, so
   * their indicators sit on the same spot) — and hides the severity filters.
   * `null` means the full, filterable list is shown.
   */
  @state()
  private focusedValidationGroup: Range[] | null = null;

  /** The violations to list, pushed by a Clippy hub. */
  @property({ attribute: false })
  violationsMap?: ViolationsMap;

  /** @see {@link violationsMap} */
  @property({ attribute: false })
  identifier?: string;

  /** Whether the view is shown. Show it with {@link showSidebarView}, so its sidebar opens. */
  @property({ type: Boolean })
  open = false;

  get label(): string {
    return msg('Errors, warnings or tips');
  }

  get #violations(): ViolationsMap {
    return this.violationsMap ?? NO_VIOLATIONS;
  }

  /** Focus the heading. */
  override focus() {
    this.shadowRoot?.querySelector<HTMLElement>('.clippy-validations-view__title')?.focus();
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;
    this.hidden = !this.open;
    if (!this.open) this.focusedValidationGroup = null;
  }

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.addEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_SIDEBAR, this.#focusValidationItem);
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATION_GROUP, this.#openValidationGroup);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.removeEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_SIDEBAR, this.#focusValidationItem);
    globalThis.removeEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATION_GROUP, this.#openValidationGroup);
    super.disconnectedCallback();
  }

  readonly #closeDialog = (event: Event) => {
    if (event instanceof CustomEvent) {
      const eventIdentifier = (event as CorrectValidationIssueEvent).detail?.identifier;
      if (eventIdentifier !== this.identifier) return;
    }
    hideSidebarView(this);
  };

  readonly #handleOverviewOpen = (event: Event) => {
    const { identifier, mode } = (event as OpenDocumentOverviewEvent).detail;
    if (identifier !== this.identifier || mode !== 'validations') return;
    this.focusedValidationGroup = null;
    showSidebarView(this);
  };

  readonly #openValidationGroup = (event: Event) => {
    const { identifier, ranges } = (event as OpenValidationGroupEvent).detail;
    if (identifier !== this.identifier) return;
    this.selectedSeverity = null;
    this.focusedValidationGroup = ranges;
    showSidebarView(this);
  };

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
    if (!range) return;

    if (!this.open && identifier === this.identifier) {
      this.focusedValidationGroup = null;
      showSidebarView(this);
    }

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
    const title = this.label;
    const violations = this.#violations;
    return html`
      <div class="clippy-sidebar-view__header">
        <h3 class="clippy-validations-view__title" tabindex="-1">${title}</h3>
      </div>
      <div class="clippy-sidebar-view__body">
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
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationsView;
  }
}
