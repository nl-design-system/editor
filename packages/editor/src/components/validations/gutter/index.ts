import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { validationsContext, type ValidationsMap } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import gutterStyles from './styles.ts';

/**
 * @summary Clippy validations gutter component
 */
@customElement('clippy-validations-gutter')
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles];

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  #goToValidation(key: string) {
    window.dispatchEvent(
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
          ([key, { boundingBox }]) =>
            boundingBox &&
            html`<li
              class="clippy-validations-gutter__indicator"
              style="inset-block-start: ${boundingBox.top}px; block-size: ${boundingBox.height}px"
              title=${key}
              @click=${() => this.#goToValidation(key)}
            ></li>`,
        )}
      </ol>
    `;
  }
}
