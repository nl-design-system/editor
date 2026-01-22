import { consume } from '@lit/context';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { type ValidationKey, validationMessages } from '@/components/validations/messages.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import gutterStyles from './styles.ts';

const tag = 'clippy-validations-gutter';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Gutter;
  }
}

@customElement(tag)
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles, unsafeCSS(paragraphStyle)];

  @state()
  private activeTooltipKey: string | null = null;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  #toggleTooltip(key: string) {
    this.activeTooltipKey = this.activeTooltipKey === key ? null : key;
  }

  override render() {
    return html`
      <ol class="clippy-validations-gutter__list" role="list" data-testid="clippy-validations-gutter">
        ${map(this.validationsContext?.entries(), ([key, { boundingBox, pos, severity, tipPayload }]) => {
          const validationKey = key.split('_')[0] as ValidationKey;
          const { description, href, tip } = validationMessages[validationKey];
          const tipHtml = tip?.(tipPayload) ?? null;
          const isActive = this.activeTooltipKey === key;
          return (
            boundingBox &&
            html`<li
              class="clippy-validations-gutter__indicator  clippy-validations-gutter__indicator--${severity}"
              @click=${() => this.#toggleTooltip(key)}
              style="inset-block-start: ${boundingBox.top}px; block-size: ${boundingBox.height}px"
            >
              <div
                class="${classMap({
                  'clippy-validation-gutter__tooltip': true,
                  'clippy-validation-gutter__tooltip--active': isActive,
                })}"
              >
                <clippy-validation-item
                  .key=${key}
                  .pos=${pos}
                  .severity=${severity}
                  .description=${description}
                  .href=${href}
                >
                  ${tipHtml ? html`<p slot="tip-html" class="nl-paragraph">${unsafeHTML(tipHtml)}</p>` : nothing}
                </clippy-validation-item>
              </div>
            </li> `
          );
        })}
      </ol>
    `;
  }
}
