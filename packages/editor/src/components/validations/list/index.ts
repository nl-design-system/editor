import { consume } from '@lit/context';
import { localized } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { ValidationsMap } from '@/types/validation.ts';
import '../validation-item';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import { type ValidationKey, validationMessages } from '@/messages';
import type { ValidationItem } from '../validation-item';
import listStyles from './styles.ts';

const tag = 'clippy-validations-list';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationsList;
  }
}

@localized()
@safeCustomElement(tag)
export class ValidationsList extends LitElement {
  static override readonly styles = [listStyles, unsafeCSS(paragraphStyle)];

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, this.#handleFocusValidationItem);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, this.#handleFocusValidationItem);
  }

  readonly #handleFocusValidationItem = (event: Event) => {
    const { key } = (event as CustomEvent<{ key: string }>).detail;

    const items = this.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).key === key);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      match.shadowRoot?.querySelector<HTMLElement>('[data-validation-key]')?.focus();
    }
  };

  override render() {
    if (!this.validationsContext || this.validationsContext.size === 0) {
      return nothing;
    }

    return html`
      <ul class="clippy-validations-list" role="list">
        ${map(this.validationsContext.entries(), ([key, { apply, pos, severity, tipPayload }]) => {
          const validationKey = key.split('_')[0] as ValidationKey;
          const { applyLabel, description, href, tip } = validationMessages()[validationKey];
          const tipHtml = tip?.(tipPayload) ?? null;
          return html`
            <clippy-validation-item
              .key=${key}
              .pos=${pos}
              .severity=${severity}
              .description=${description}
              .href=${href}
              .applyLabel=${applyLabel}
              .apply=${apply}
            >
              ${tipHtml ? html`<p class="nl-paragraph" slot="tip-html">${tipHtml}</p>` : nothing}
            </clippy-validation-item>
          `;
        })}
      </ul>
    `;
  }
}
