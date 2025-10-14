import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import toolbarButtonStyles from './styles.ts';

@customElement('clippy-toolbar-button')
export class ToolbarButton extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: Boolean }) pressed = false;
  @property({ type: Function }) onClick?: () => void;

  static override readonly styles = [toolbarButtonStyles];

  override render() {
    return html`
      <button
        type="button"
        aria-label=${this.label}
        aria-pressed=${this.pressed}
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

declare global {
  interface HTMLElementTagNameMap {
    'clippy-toolbar-button': ToolbarButton;
  }
}
