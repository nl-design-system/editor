import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { ValidationEntry, ValidationsMap } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { validationMessages } from '@/messages';
import './../validation-item';
import { contentValidations, documentValidations } from '@/validators/constants.ts';
import listStyles from './styles.ts';

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
type ValidationKey = ContentValidationKey | DocumentValidationKey;

const sortByPos = (a: ValidationEntry, b: ValidationEntry) => a[1].pos - b[1].pos;

@customElement('clippy-validations-list')
export class ValidationsList extends LitElement {
  static override readonly styles = [listStyles, unsafeCSS(numberBadgeStyles)];
  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  @queryAll('clippy-validation-item')
  private readonly validationListItems: HTMLUListElement[] | undefined;

  focusKey(key: string) {
    console.log('focusKey', key);
    this.validationListItems?.forEach((el) => {
      const listItem = el.shadowRoot?.querySelector(`[data-validation-key="${key}"]`);
      if (listItem instanceof HTMLElement) {
        listItem.focus();
      }
    });
  }

  override render() {
    const { size = 0 } = this.validationsContext || {};
    const validations = [...(this.validationsContext?.entries() ?? [])];
    const sortedValidations = validations.slice().sort(sortByPos);
    return html`
      <ul class="clippy-dialog__list" data-testid="clippy-validations-list">
        ${size > 0
          ? map(sortedValidations, ([key, { pos, severity, tipPayload }]) => {
              const validationKey = key.split('_')[0];
              const { description, href, tip } = validationMessages()[validationKey as ValidationKey];
              const tipHtml = tip?.(tipPayload) ?? null;
              return html`
                <clippy-validation-item
                  .key=${key}
                  .pos=${pos}
                  .severity=${severity}
                  .description=${description}
                  .href=${href}
                >
                  ${tipHtml ? html`<p slot="tip-html" class="nl-paragraph">${tipHtml}</p>` : nothing}
                </clippy-validation-item>
              `;
            })
          : html`<li class="clippy-dialog__list-item">Geen toegankelijkheidsfouten gevonden.</li>`}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validations-list': ValidationsList;
  }
}
