import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

@customElement('clippy-listbox-option')
export class ListboxOption extends LitElement {
  @property({ type: String }) override id = '';
  @property({ type: Boolean }) active = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) selected = false;

  static override readonly styles = [
    css`
      .clippy-combobox__option {
        display: flex;
        padding-inline: var(--basis-space-inline-lg);
        padding-block: var(--basis-space-inline-lg);
      }

      .clippy-combobox__option:focus {
        background-color: var(--basis-color-action-2-bg-default);
        outline: none;
      }

      .clippy-combobox__option--active {
        background-color: var(--basis-color-action-1-bg-default);
      }

      .clippy-combobox__option--disabled {
        color: gray;
      }

      .clippy-combobox__option--selected {
        font-weight: bold;
      }
    `,
  ];

  override render() {
    const classes = {
      'clippy-combobox__option': true,
      'clippy-combobox__option--active': this.active,
      'clippy-combobox__option--disabled': this.disabled,
      'clippy-combobox__option--selected': this.selected,
    };

    return html`
      <li
        class=${classMap(classes)}
        id=${this.id}
        aria-disabled=${ifDefined(this.disabled || undefined)}
        aria-selected=${this.selected ? 'true' : 'false'}
        tabindex="-1"
        role="option"
      >
        <slot></slot>
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-listbox-option': ListboxOption;
  }
}
