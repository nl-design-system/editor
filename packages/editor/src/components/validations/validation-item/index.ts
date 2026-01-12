import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import linkCss from '@nl-design-system-candidate/link-css/link.css?inline';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationSeverity } from '@/types/validation.ts';
import { CustomEvents } from '@/events';
import validationListItemStyles from './styles.ts';

const tag = 'clippy-validation-item';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationItem;
  }
}

@customElement(tag)
export class ValidationItem extends LitElement {
  static override readonly styles = [validationListItemStyles, unsafeCSS(linkCss), unsafeCSS(buttonCss)];

  @property({ type: String }) key: string = '';
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
      <li
        class="clippy-dialog__list-item clippy-dialog__list-item--${this.severity}"
        data-validation-key="${this.key}"
        tabindex="-1"
      >
        <div class="clippy-dialog__list-item-message">
          <strong>${this.description}</strong>
          <span class="clippy-dialog__list-item-severity clippy-dialog__list-item-severity--${this.severity}">
            ${unsafeSVG(this.#getAlertIcon())}
          </span>
        </div>
        <slot name="tip-html" class="clippy-dialog__list-item-tip"></slot>
        ${this.href
          ? html`
              <div class="clippy-dialog__list-item-link">
                <a class="nl-link" href="${this.href}" target="_blank"> Uitgebreide toelichting </a>
              </div>
            `
          : null}
        <div class="clippy-dialog__list-item-actions">
          <button class="nl-button nl-button--disabled" aria-disabled="true">Negeren</button>
          <button class="nl-button nl-button--secondary" @click=${this.#focusNode}>Aanpassen</button>
        </div>
      </li>
    `;
  }
}
