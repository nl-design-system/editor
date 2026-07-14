import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import ListIcon from '@tabler/icons/outline/list.svg?raw';
import { html, LitElement, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import { map } from 'lit/directives/map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationsMap, ValidationSeverity } from '@/types/validation';
import { validationSeverity } from '@/constants';
import { identifierContext } from '@/context/identifierContext';
import { validationsContext } from '@/context/validationsContext';
import { CustomEvents, type FilterChangeDetail } from '@/events';
import validationFiltersStyles from './styles';

type FilterKey = ValidationSeverity | 'all';

interface Filter {
  key: FilterKey;
  label: string;
}

const tag = 'clippy-validation-filters';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationFilters;
  }
}

/**
 * Row of toggle buttons that filter the validation list by severity. Exactly one
 * filter is active at a time; selecting one dispatches a global
 * {@link CustomEvents.FILTER_CHANGE} event so the drawer can update the list.
 *
 * @tag clippy-validation-filters
 *
 * @fires {CustomEvent<FilterChangeDetail>} FILTER_CHANGE - Dispatched when a filter is selected.
 */
@localized()
@safeCustomElement(tag)
export class ValidationFilters extends LitElement {
  static override readonly styles = [validationFiltersStyles, unsafeCSS(numberBadgeStyles)];

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  @state()
  private activeFilter: FilterKey = 'all';

  get #filters(): Filter[] {
    return [
      { key: 'all', label: msg('All') },
      { key: validationSeverity.ERROR, label: msg('Errors') },
      { key: validationSeverity.WARNING, label: msg('Warnings') },
      { key: validationSeverity.INFO, label: msg('Tips') },
    ];
  }

  #getCountForSeverity(severity: ValidationSeverity): number {
    if (!this.validationsContext) return 0;
    return Array.from(this.validationsContext.values()).filter((validation) => validation.severity === severity).length;
  }

  #getTotalCount(): number {
    return this.validationsContext?.size ?? 0;
  }

  #getCount(key: FilterKey): number {
    if (key === 'all') return this.#getTotalCount();
    return this.#getCountForSeverity(key);
  }

  #getFilterIcon(key: FilterKey): string {
    switch (key) {
      case validationSeverity.ERROR:
        return AlertTriangleIcon;
      case validationSeverity.WARNING:
        return AlertCircleIcon;
      case validationSeverity.INFO:
        return InfoCircleIcon;
      default:
        return ListIcon;
    }
  }

  #handleFilterClick(key: FilterKey) {
    this.activeFilter = key;
    this.dispatchEvent(
      new CustomEvent<FilterChangeDetail>(CustomEvents.FILTER_CHANGE, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, severity: key === 'all' ? null : key },
      }),
    );
  }

  override render() {
    return html`
      <div class="clippy-validation-filters" role="group" aria-label=${msg('Filter validations by severity')}>
        ${map(this.#filters, ({ key, label }) => {
          const count = this.#getCount(key);
          const isActive = this.activeFilter === key;

          return html`
            <clippy-button
              class="clippy-validation-filters__filter"
              purpose="secondary"
              size="small"
              toggle
              ?pressed=${isActive}
              ?disabled=${count === 0}
              @click=${() => count > 0 && this.#handleFilterClick(key)}
            >
              <span slot="iconStart">${unsafeSVG(this.#getFilterIcon(key))}</span>
              ${label}
              <span class="nl-number-badge" slot="iconEnd">${count}</span>
            </clippy-button>
          `;
        })}
      </div>
    `;
  }
}
