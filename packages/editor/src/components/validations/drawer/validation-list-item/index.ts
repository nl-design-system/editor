import AlertIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import ExclamationIcon from '@tabler/icons/outline/exclamation-circle.svg?raw';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { CustomEvents } from '@/events';
import validationListItemStyles from './styles.ts';

const severityLevels: Record<'error' | 'warning', string> = {
  error: 'Fout',
  warning: 'Waarschuwing',
};

export type ValidationSeverity = keyof typeof severityLevels;

@customElement('clippy-validation-list-item')
export class ClippyValidationItem extends LitElement {
  static override readonly styles = [validationListItemStyles];

  @property({ type: Number }) pos: number = 0;
  @property({ type: String }) severity!: ValidationSeverity;
  @property({ type: String }) description!: string;
  @property({ type: String }) href?: string;
  // Accept TemplateResult or raw HTML string. Keep out of attributes to avoid stringification.
  @property({ type: String }) tipHtml?: string;

  #focusNode = () => {
    this.dispatchEvent(
      new CustomEvent(CustomEvents.FOCUS_NODE, { bubbles: true, composed: true, detail: { pos: this.pos } }),
    );
  };

  override render() {
    return html`
      <li class="clippy-dialog__list-item" tabindex="0">
        <div class="clippy-dialog__list-item-message">
          <span class="clippy-dialog__list-item-severity clippy-dialog__list-item-severity--${this.severity}">
            ${this.severity === 'warning' ? unsafeSVG(AlertIcon) : unsafeSVG(ExclamationIcon)}
          </span>
          ${this.description} (${severityLevels[this.severity]})
        </div>
        ${this.tipHtml
          ? html`<div class="clippy-dialog__list-item-tip" data-test-id="tip-html">${unsafeHTML(this.tipHtml)}</div>`
          : null}
        ${this.href
          ? html`
              <div class="clippy-dialog__list-item-link">
                <utrecht-link href="${this.href}" target="_blank"> Uitgebreide toelichting </utrecht-link>
              </div>
            `
          : null}
        <div class="clippy-dialog__list-item-actions">
          <utrecht-button disabled="true">Negeren</utrecht-button>
          <utrecht-button appearance="secondary-action-button" @click=${this.#focusNode}>Aanpassen</utrecht-button>
        </div>
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validation-list-item': ClippyValidationItem;
  }
}
