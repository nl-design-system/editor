import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import toolbarButtonStyles from './styles.ts';

/**
 * @summary Clippy toolbar button component
 * @slot Button content
 * @attr label {string} - Label for the button
 * @attr pressed {boolean} - Whether the button is pressed
 * @attr disabled {boolean} - Whether the button is disabled
 * @attr onClick {function} - Callback function when the button is clicked
 */
@customElement('clippy-toolbar-button')
export class ToolbarButton extends LitElement {
  @property({ reflect: true, type: String }) label = '';
  @property({ reflect: true, type: Boolean }) pressed = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true, type: Function }) onClick?: () => void;

  static override readonly styles = [toolbarButtonStyles];

  override render() {
    return html`
      <button
        type="button"
        aria-label=${this.label}
        aria-pressed=${this.pressed}
        ?disabled=${this.disabled}
        class=${classMap({
          'clippy-toolbar-button': true,
          'clippy-toolbar-button--pressed': this.pressed,
        })}
        @click=${this.onClick}
      >
        <slot></slot>
      </button>
    `;
  }
}
