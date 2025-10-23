import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import type { ComboBoxOption } from "./types.ts";

@customElement("clippy-combo-box")
export class ComboBox extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Number }) private activeIndex = -1;
  @property({ type: Boolean }) private isOpen = false;
  @property({ type: Array }) private options: ComboBoxOption[] = [];
  @property({ type: String }) value = "";

  override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has("options")) {
      const activeOption = this.options.find((option) => option.active);
      if (activeOption) {
        this.value = activeOption.label;
      }
    }
  }

  static override readonly styles = [
    css`
      :host {
        position: relative;
        display: inline-block;
      }
      .clippy-combo-box {
        inline-size: 100%;
        max-inline-size: 500px;
        position: relative;
      }
      .clippy-combobox__input {
        line-height: 1.8em;
        background-color: #fff;
        border: 1px solid var(--basis-color-action-1-color-active);
        border-radius: 3px;
        color: var(--basis-color-action-1-color-active);
        margin-inline-end: var(--basis-space-inline-sm);
        padding-block: var(--basis-space-inline-sm);
        padding-inline: var(--basis-space-inline-md);
      }
    `,
  ];

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value.toLowerCase();
    this.isOpen = true;
    this.activeIndex = -1;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.disabled || this.readOnly) return;

    const filteredCount = this.filteredOptions.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.isOpen = true;
        this.activeIndex = this.activeIndex < filteredCount - 1 ? this.activeIndex + 1 : 0;
        this.updateActiveDescendant();
        break;

      case "ArrowUp":
        e.preventDefault();
        this.isOpen = true;
        this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : filteredCount - 1;
        this.updateActiveDescendant();
        break;

      case "Enter":
        e.preventDefault();
        if (this.activeIndex >= 0 && this.activeIndex < filteredCount) {
          this.selectOption(this.filteredOptions[this.activeIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        this.isOpen = false;
        this.activeIndex = -1;
        break;

      case "Home":
        e.preventDefault();
        this.activeIndex = 0;
        this.updateActiveDescendant();
        break;

      case "End":
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

    this.dispatchEvent(new CustomEvent("change", { detail: { value: option.value } }));
  }
  override render() {
    const classes = {
      "clippy-combobox__input": true,
      "clippy-combobox__input--disabled": this.disabled,
      "clippy-combobox__input--html-input": true,
      "clippy-combobox__input--readonly": this.readOnly,
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
        dir=${ifDefined(this.dir ?? "auto")}
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

@customElement("clippy-listbox")
export class Listbox extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;

  static override readonly styles = [
    css`
      .clippy-popover {
        background-color: canvas;
        block-size: fit-content;
        border-width: 0;
        color: canvastext;
        inline-size: fit-content;
        inset-block-start: 100%;
        overflow: auto;
        padding-block-end: 0;
        padding-block-start: 0;
        padding-inline-end: 0;
        padding-inline-start: 0;
        position: absolute;
      }

      .clippy-listbox__list {
        margin-inline: 0;
        margin-block: 0;
        padding-inline: 0;
      }
    `,
  ];

  override render() {
    const classes = {
      "clippy-popover": true,
      "utrecht-listbox--disabled": this.disabled,
      "utrecht-listbox--read-only": this.readOnly,
    };

    return html`
      <div
        class=${classMap(classes)}
        id="clippy-listbox-id"
        role="listbox"
        aria-disabled=${ifDefined(this.disabled || undefined)}
        aria-readonly=${ifDefined(this.readOnly || undefined)}
        tabindex="0"
      >
        <ul class="clippy-listbox__list" role="none">
          <slot></slot>
        </ul>
      </div>
    `;
  }
}

@customElement("clippy-listbox-option")
export class ListboxOption extends LitElement {
  @property({ type: String }) override id = "";
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
      "clippy-combobox__option": true,
      "clippy-combobox__option--active": this.active,
      "clippy-combobox__option--disabled": this.disabled,
      "clippy-combobox__option--selected": this.selected,
    };

    return html`
      <li
        class=${classMap(classes)}
        id=${this.id}
        aria-disabled=${ifDefined(this.disabled || undefined)}
        aria-selected=${this.selected ? "true" : "false"}
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
    "clippy-combo-box": ComboBox;
    "clippy-listbox": Listbox;
    "clippy-listbox-option": ListboxOption;
  }
}
