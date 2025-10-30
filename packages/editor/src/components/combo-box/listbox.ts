import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

@customElement('clippy-listbox')
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
      'clippy-popover': true,
      'utrecht-listbox--disabled': this.disabled,
      'utrecht-listbox--read-only': this.readOnly,
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

declare global {
  interface HTMLElementTagNameMap {
    'clippy-listbox': Listbox;
  }
}
