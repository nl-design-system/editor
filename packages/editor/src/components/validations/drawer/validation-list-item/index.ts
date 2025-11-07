import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { CustomEvents } from '@/events';
import { validationSeverity } from '@/validators/constants.ts';
import validationListItemStyles from './styles.ts';

type SeverityLevel = (typeof validationSeverity)[keyof typeof validationSeverity];

const severityLevels: Record<SeverityLevel, string> = {
  error: 'Fout',
  info: 'Info',
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

  readonly #focusNode = () => {
    this.dispatchEvent(
      new CustomEvent(CustomEvents.FOCUS_NODE, { bubbles: true, composed: true, detail: { pos: this.pos } }),
    );
  };

  readonly #getAlertIcon = () => {
    switch (this.severity) {
      case 'error':
        return AlertTriangleIcon;
      case 'warning':
        return AlertCircleIcon;
      default:
        return InfoCircleIcon;
    }
  };

  override render() {
    return html`
      <li class="clippy-dialog__list-item" tabindex="0">
        <div class="clippy-dialog__list-item-message">
          <span class="clippy-dialog__list-item-severity clippy-dialog__list-item-severity--${this.severity}">
            ${unsafeSVG(this.#getAlertIcon())}
          </span>
          ${this.description} (${severityLevels[this.severity]})
        </div>
        <slot name="tip-html" class="clippy-dialog__list-item-tip"></slot>
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
