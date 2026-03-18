import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkCss from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import ListDetailsIcon from '@tabler/icons/outline/list-details.svg?raw';
import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { CorrectValidationFunction, ValidationSeverity } from '@/types/validation.ts';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { identifierContext } from '@/context/identifierContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { CustomEvents } from '@/events';
import validationListItemStyles from './styles.ts';

const tag = 'clippy-validation-item';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationItem;
  }
}

const ariaDescribedBy = 'validation-item-header';

@localized()
@safeCustomElement(tag)
export class ValidationItem extends LitElement {
  static override readonly styles = [
    validationListItemStyles,
    unsafeCSS(paragraphStyle),
    unsafeCSS(headingStyle),
    unsafeCSS(linkCss),
  ];

  @property({ type: String }) key: string = '';
  @property({ type: String }) mode: 'tooltip' | 'list' = 'list';
  @property({ type: Number }) pos: number = 0;
  @property({ type: String }) severity!: ValidationSeverity;
  @property({ type: String }) description!: string;
  @property({ type: String }) href?: string;
  @property({ type: String }) applyLabel?: string;
  @property({ type: Function }) apply?: CorrectValidationFunction;

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  @editor()
  private readonly editor: Editor | undefined;

  readonly #focusNode = () => {
    this.dispatchEvent(
      new CustomEvent(CustomEvents.FOCUS_NODE, {
        bubbles: true,
        composed: true,
        detail: { pos: this.pos },
      }),
    );
  };

  readonly #applyFix = () => {
    this.dispatchEvent(
      new CustomEvent(CustomEvents.APPLY_FIX, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier },
      }),
    );
    if (this.editor && typeof this.apply === 'function') {
      this.apply(this.editor);
    }
  };

  #handleValidationItemClick(event: Event, key: string) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, key },
      }),
    );
  }

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
          <h4 class="nl-heading nl-heading--level-4" id=${ariaDescribedBy}>${this.description}</h4>
          <span class="clippy-dialog__list-item-severity clippy-dialog__list-item-severity--${this.severity}">
            ${unsafeSVG(this.#getAlertIcon())}
          </span>
        </div>
        <slot name="tip-html" class="clippy-dialog__list-item-tip"></slot>
        ${this.href
          ? html`
              <p class="clippy-dialog__list-item-link nl-paragraph">
                <a
                  class="nl-link"
                  href="${this.href}"
                  target="_blank"
                  rel="noreferrer"
                  aria-describedby=${ariaDescribedBy}
                >
                  ${msg('Extensive explanation')}
                </a>
              </p>
            `
          : null}
        <div class="clippy-dialog__list-item-actions">
          ${this.mode === 'tooltip'
            ? html`<clippy-button
                @click=${(event: Event) => this.#handleValidationItemClick(event, this.key)}
                icon-only
                purpose="subtle"
              >
                <clippy-icon slot="iconStart">${unsafeSVG(ListDetailsIcon)}</clippy-icon>
                ${msg('Open in drawer')}
              </clippy-button>`
            : nothing}
          <clippy-button purpose="secondary" @click=${this.#focusNode} aria-describedby=${ariaDescribedBy}>
            ${msg('Focus')}
          </clippy-button>
          ${typeof this.apply === 'function'
            ? html`<clippy-button purpose="primary" @click=${this.#applyFix} aria-describedby=${ariaDescribedBy}>
                ${this.applyLabel ?? msg('Apply')}
              </clippy-button>`
            : nothing}
        </div>
      </li>
    `;
  }
}
