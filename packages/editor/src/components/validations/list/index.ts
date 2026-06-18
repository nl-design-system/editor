import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '../validation-item';
import type { ValidationsMap } from '@/types/validation.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { CustomEvents, type FocusValidationItemInListEvent } from '@/events';
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
    const { range } = (event as FocusValidationItemInListEvent).detail;

    const items = this.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).range === range);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (match as ValidationItem).focus();
    }
  };

  override render() {
    if (!this.validationsContext || this.validationsContext.size === 0) {
      const emptyMessage = msg(str`No validation issues found`);
      return html`<p class="nl-paragraph">${emptyMessage}</p>`;
    }

    return html`
      <ul class="clippy-validations-list" role="list">
        ${map(this.validationsContext.entries(), ([, { correct, range, severity, tipPayload, validatorKey }]) => {
          const valKey = validatorKey as ValidationKey;
          const { customCorrectLabel, description, href, tip } = validationMessages()[valKey];
          const tipHtml = tip?.(tipPayload) ?? null;
          return html`
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
          `;
        })}
      </ul>
    `;
  }
}
