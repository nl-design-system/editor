import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import type { ValidationsMap, ValidationSeverity } from '@/types/validation.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { validationSeverity } from '@/validators/constants.ts';
import tabsStyles from './styles.ts';
import { CustomEvents } from '@/events';

type TabKey = ValidationSeverity | 'all';

interface Tab {
  key: TabKey;
  label: string;
}

const tabs: Tab[] = [
  { key: 'all', label: 'Alle' },
  { key: validationSeverity.ERROR, label: 'Fouten' },
  { key: validationSeverity.WARNING, label: 'Waarschuwingen' },
  { key: validationSeverity.INFO, label: 'Tips' },
];

const tag = 'clippy-tabs';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Tabs;
  }
}

@customElement(tag)
export class Tabs extends LitElement {
  static override readonly styles = [tabsStyles, unsafeCSS(numberBadgeStyles)];

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  @state()
  private activeTab: TabKey = 'all';

  #getCountForSeverity(severity: ValidationSeverity): number {
    if (!this.validationsContext) return 0;
    return Array.from(this.validationsContext.values()).filter((validation) => validation.severity === severity).length;
  }

  #getTotalCount(): number {
    return this.validationsContext?.size ?? 0;
  }

  #handleTabClick(key: TabKey) {
    this.activeTab = key;
    this.dispatchEvent(
      new CustomEvent(CustomEvents.TAB_CHANGE, {
        bubbles: true,
        composed: true,
        detail: { severity: key === 'all' ? null : key },
      }),
    );
  }

  #getCount(key: TabKey): number {
    if (key === 'all') return this.#getTotalCount();
    return this.#getCountForSeverity(key);
  }

  override render() {
    return html`
      <div class="clippy-tabs" role="tablist" aria-label="Filter validaties op ernst">
        ${map(tabs, ({ key, label }) => {
          const count = this.#getCount(key);
          const isActive = this.activeTab === key;

          return html`
            <button
              class="${classMap({
                'clippy-tabs__tab': true,
                'clippy-tabs__tab--active': isActive,
              })}"
              role="tab"
              aria-selected="${isActive}"
              aria-controls="validation-list"
              @click="${() => this.#handleTabClick(key)}"
              ?disabled="${count === 0}"
            >
              <span class="clippy-tabs__label">${label}</span>
              <span class="nl-number-badge" aria-label="${count} items"> ${count} </span>
            </button>
          `;
        })}
      </div>
    `;
  }
}
