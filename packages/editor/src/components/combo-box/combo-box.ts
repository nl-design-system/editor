import { html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { ComboBoxOption } from './types.ts';
import comboBoxStyles from './styles.ts';

@customElement('clippy-combo-box')
export class ComboBox extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Number }) private activeIndex = -1;
  @property({ type: Boolean }) private isOpen = false;
  @property({ type: Array }) private options: ComboBoxOption[] = [];
  @property({ type: String }) value = '';
  @property({ type: Function }) onSelect = (value: string) => value;

  override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('options')) {
      const activeOption = this.options.find((option) => option.active);
      if (activeOption) {
        this.value = activeOption.label;
      }
    }
  }

  static override readonly styles = [comboBoxStyles];

  private handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.value = input.value.toLowerCase();
    this.isOpen = true;
    this.activeIndex = -1;
  };

  private handleKeyDown(e: KeyboardEvent) {
    if (this.disabled || this.readOnly) return;

    const filteredCount = this.filteredOptions.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.isOpen = true;
        this.activeIndex = this.activeIndex < filteredCount - 1 ? this.activeIndex + 1 : 0;
        this.updateActiveDescendant(); // TODO: needed?
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.isOpen = true;
        this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : filteredCount - 1;
        this.updateActiveDescendant();
        break;

      case 'Enter':
        e.preventDefault();
        if (this.activeIndex >= 0 && this.activeIndex < filteredCount) {
          this.selectOption(this.filteredOptions[this.activeIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.isOpen = false;
        this.activeIndex = -1;
        break;

      case 'Home':
        e.preventDefault();
        this.activeIndex = 0;
        this.updateActiveDescendant();
        break;

      case 'End':
        e.preventDefault();
        this.activeIndex = filteredCount - 1;
        this.updateActiveDescendant();
        break;
    }
  }
  private updateActiveDescendant() {
    this.requestUpdate();
  }

  @state()
  private get filteredOptions(): ComboBoxOption[] {
    if (this.value.length === 0) {
      return this.options;
    }
    return this.options.filter((option) => option.label.toLowerCase().includes(this.value.toLowerCase()));
  }
  private selectOption(option: (typeof this.options)[0]) {
    this.value = option.label;
    this.isOpen = false;
    this.activeIndex = -1;

    this.onSelect(option.value);
  }
  override render() {
    const classes = {
      'clippy-combobox__input': true,
      'clippy-combobox__input--disabled': this.disabled,
      'clippy-combobox__input--html-input': true,
      'clippy-combobox__input--readonly': this.readOnly,
    };

    return html`
      <input
        type="text"
        name="clippy-combo-box"
        class=${classMap(classes)}
        .value=${this.value}
        @input=${this.handleInput}
        @keydown=${this.handleKeyDown}
        @focus=${() => (this.isOpen = true)}
        @blur=${() => (this.isOpen = false)}
        dir=${ifDefined(this.dir ?? 'auto')}
        ?disabled=${this.disabled}
        ?readonly=${this.readOnly}
        aria-activedescendant="${this.options.find(({ value }) => value)?.value}"
        aria-controls="clippy-listbox-id" /* TODO: add id from property */
      />
      <clippy-listbox
        disabled="${this.disabled}"
        readOnly="${this.readOnly}"
        ?hidden="${!this.isOpen}"
      >
        ${
          this.filteredOptions.length > 0
            ? this.filteredOptions.map(
                (option, index) => html`
                  <clippy-listbox-option
                    id=${option.value}
                    ?active=${index === this.activeIndex || option.active}
                    @click=${() => this.selectOption(option)}
                  >
                    ${option.label}
                  </clippy-listbox-option>
                `,
              )
            : html`<clippy-listbox-option disabled>Geen resultaten gevonden</clippy-listbox-option>`
        }
      </clippy-listbox>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-combo-box': ComboBox;
  }
}
