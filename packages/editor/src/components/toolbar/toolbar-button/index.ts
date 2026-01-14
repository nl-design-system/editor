import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import { LitElement, html, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import toolbarButtonStyles from './styles.ts';

const tag = 'clippy-button';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ToolbarButton;
  }
}

type ButtonSize = 'small' | 'medium';
const defaultSize: ButtonSize = 'medium';

@customElement(tag)
export class ToolbarButton extends LitElement {
  @property({ type: Boolean }) 'icon-only' = false;
  @property({ type: Boolean }) toggle = undefined;
  @property({ type: Boolean }) pressed = false;
  @property({ type: Boolean }) busy = false;
  @property({ type: Boolean }) disabled = false;
  @property({
    converter: {
      fromAttribute: (value: string | null): ButtonSize => {
        if (value === 'small' || value === 'medium') {
          return value;
        }
        console.warn(`Invalid size "${value}". Using default "medium".`);
        return 'medium';
      },
    },
    type: String,
  })
  size: ButtonSize = defaultSize;

  static override readonly styles = [toolbarButtonStyles, unsafeCSS(buttonCss)];

  override render() {
    return html`
      <button
        aria-pressed=${this.toggle ? this.pressed : nothing}
        aria-disabled=${this.disabled || nothing}
        class=${classMap({
          [`clippy-nl-button--${this.size}`]: this.size !== defaultSize,
          'nl-button': true,
          'nl-button--busy': this.busy,
          'nl-button--disabled': this.disabled,
          'nl-button--icon-only': this['icon-only'],
          'nl-button--pressed': this.toggle ? this.pressed : false,
        })}
      >
        <slot name="iconStart" class="nl-button__icon-start"></slot>
        <span class="nl-button__label"><slot></slot></span>
        <slot name="iconEnd" class="nl-button__icon-end"></slot>
      </button>
    `;
  }
}
