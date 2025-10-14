import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import CloseIcon from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationError } from '../types/validation.ts';
import gutterStyles from './styles.ts';

@customElement('clippy-gutter')
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles];
  @state()
  private isOpen = false;
  private validationErrors: ValidationError[] = [];

  private toggleOpen = () => {
    this.isOpen = !this.isOpen;
  };

  private handleValidationError = (event: CustomEventInit<ValidationError>) => {
    if (event.detail) {
      this.validationErrors = [...this.validationErrors, event.detail];
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('VALIDATION_ERROR', this.handleValidationError);
  }

  override disconnectedCallback() {
    window.removeEventListener('VALIDATION_ERROR', this.handleValidationError);
    super.disconnectedCallback();
  }

  override render() {
    return html`<div>
      <ol class="gutter-list" role="list">
        ${map(
          this.validationErrors,
          (item) => html`<li class="gutter-item" style="top: ${item.offsetTop}px" title=${item.string}></li>`,
        )}
      </ol>
      <button
        class="overlay-toggle"
        @click=${this.toggleOpen}
        aria-expanded=${this.isOpen}
        aria-controls="overlay-content"
      >
        ${this.isOpen ? unsafeSVG(CloseIcon) : unsafeSVG(AccessibleIcon)}
      </button>
      ${this.isOpen
        ? html`<div id="overlay-content" class="overlay-content" role="region" aria-label="Toegankelijkheidsfouten">
            <h2>Toegankelijkheidsfouten</h2>
            <ul>
              ${map(this.validationErrors, (item) => html`<li>${item.string}</li>`)}
            </ul>
          </div>`
        : null}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-gutter': Gutter;
  }
}
