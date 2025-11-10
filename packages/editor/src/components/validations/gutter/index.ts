import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import gutterStyles from './styles.ts';

@customElement('clippy-validations-gutter')
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles];

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  #goToValidation(key: string) {
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, {
        bubbles: true,
        composed: true,
        detail: { key },
      }),
    );
  }

  override render() {
    return html`
      <ol class="clippy-validations-gutter__list" role="list">
        ${map(
          this.validationsContext?.entries(),
          ([key, { boundingBox, severity }]) =>
            boundingBox &&
            html`<li
              class="clippy-validations-gutter__indicator clippy-validations-gutter__indicator--${severity}"
              style="inset-block-start: ${boundingBox.top}px; block-size: ${boundingBox.height}px"
              @click=${() => this.#goToValidation(key)}
            ></li>`,
        )}
      </ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validations-gutter': Gutter;
  }
}
