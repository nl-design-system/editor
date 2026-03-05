import { consume } from '@lit/context';
import { localized } from '@lit/localize';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import { type ValidationKey, validationMessages } from '@/messages';
import gutterStyles from './styles.ts';

const tag = 'clippy-validations-gutter';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Gutter;
  }
}

@localized()
@customElement(tag)
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles, unsafeCSS(paragraphStyle)];

  @property({ type: String })
  mode: 'tooltip' | 'list' = 'tooltip';

  @state()
  private activeTooltipKey: string | null = null;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  #handleIndicatorClick(key: string) {
    if (this.mode === 'list') {
      this.dispatchEvent(
        new CustomEvent(CustomEvents.FOCUS_VALIDATION_ITEM_IN_LIST, { bubbles: true, composed: true, detail: { key } }),
      );
    } else {
      this.activeTooltipKey = this.activeTooltipKey === key ? null : key;
    }
  }

  override render() {
    if (!this.validationsContext || this.validationsContext.size === 0) {
      return nothing;
    }

    return html`
      <ol class="clippy-validations-gutter__list" role="list" data-testid="clippy-validations-gutter">
        ${map(this.validationsContext?.entries(), ([key, { boundingBox, pos, severity, tipPayload }]) => {
          const validationKey = key.split('_')[0] as ValidationKey;
          const { description, href, tip } = validationMessages()[validationKey];
          const tipHtml = tip?.(tipPayload) ?? null;
          const isActive = this.activeTooltipKey === key;
          return (
            boundingBox &&
            html`<li
              class="clippy-validations-gutter__indicator"
              style="inset-block-start: ${boundingBox.top}px; block-size: ${boundingBox.height}px"
            >
              <button
                class="${classMap({
                  [`clippy-validations-gutter__toggle--${severity}`]: true,
                  'clippy-validations-gutter__toggle': true,
                  'clippy-validations-gutter__toggle--active': isActive,
                })}"
                aria-expanded=${isActive ? 'true' : 'false'}
                aria-label=${description}
                @click=${() => this.#handleIndicatorClick(key)}
              ></button>
              <div
                class="${classMap({
                  'clippy-validation-gutter__tooltip': true,
                  'clippy-validation-gutter__tooltip--active': isActive,
                })}"
              >
                <clippy-validation-item
                  .key=${key}
                  .mode=${this.mode}
                  .pos=${pos}
                  .severity=${severity}
                  .description=${description}
                  .href=${href}
                >
                  ${tipHtml ? html`<p slot="tip-html" class="nl-paragraph">${tipHtml}</p>` : nothing}
                </clippy-validation-item>
              </div>
            </li> `
          );
        })}
      </ol>
    `;
  }
}
