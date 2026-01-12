import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import guidelineStyles from './styles';

@customElement('clippy-guideline')
export class ClippyGuideline extends LitElement {
  static override readonly styles = [guidelineStyles];

  @property({ attribute: true })
  type: 'positive' | 'negative' = 'positive';

  override render() {
    const { type } = this;
    return html`
      <div class=${`clippy-guideline ${type ? `clippy-guideline--${type}` : ''}`}>
        <div class="clippy-guideline__description">
          <h2 class=${`clippy-guideline__badge ${type ? `clippy-guideline__badge--${type}` : ''}`}>
            ${type === 'positive'
              ? html`<svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="tabler-icon tabler-icon-mood-happy nlds-guideline__icon"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                  <path d="M9 9l.01 0"></path>
                  <path d="M15 9l.01 0"></path>
                  <path d="M8 13a4 4 0 1 0 8 0h-8"></path>
                </svg>`
              : nothing}
            ${type === 'negative'
              ? html`<svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="tabler-icon tabler-icon-mood-sad clippy-guideline__icon"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                  <path d="M9 10l.01 0"></path>
                  <path d="M15 10l.01 0"></path>
                  <path d="M9.5 15.25a3.5 3.5 0 0 1 5 0"></path>
                </svg>`
              : nothing}
            <span class="clippy-guideline__title"><slot name="heading"></slot></span>
          </h2>
          <slot name="description"></slot>
        </div>
        <div class="clippy-guideline__example">
          <div class="clippy-canvas">
            <div class="clippy-canvas__example">
              <slot name="example"></slot>
            </div>
          </div>
        </div>
        <div class="clippy-guideline__status">
          <slot name="status"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-guideline': ClippyGuideline;
  }
}
