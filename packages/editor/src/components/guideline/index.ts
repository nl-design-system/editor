import MoodHappyIcon from '@tabler/icons/outline/mood-happy.svg?raw';
import MoodSadIcon from '@tabler/icons/outline/mood-sad.svg?raw';
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import guidelineStyles from './styles';

@customElement('clippy-guideline')
export class ClippyGuideline extends LitElement {
  static override readonly styles = [guidelineStyles];

  @property({ attribute: true })
  type: 'positive' | 'negative' = 'positive';

  override render() {
    const { type } = this;
    return html`
      <div
        class=${classMap({
          [`clippy-guideline--${type}`]: !!type,
          'clippy-guideline': true,
        })}
      >
        <div class="clippy-guideline__description">
          <h2
            class=${classMap({
              [`clippy-guideline__badge--${type}`]: !!type,
              'clippy-guideline__badge': true,
            })}
          >
            ${type === 'positive' ? unsafeSVG(MoodHappyIcon) : nothing}
            ${type === 'negative' ? unsafeSVG(MoodSadIcon) : nothing}
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
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-guideline': ClippyGuideline;
  }
}
