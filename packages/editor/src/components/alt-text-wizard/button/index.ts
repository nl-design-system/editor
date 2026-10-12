import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import WandIcon from '@tabler/icons/outline/wand.svg?raw';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { html, LitElement } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { initializeLocale } from '@/localization';
import { THEME_CLASS } from '@/utils/colorScheme';

const tag = 'clippy-alt-text-wizard-button';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: AltTextWizardButton;
  }
}

@localized()
@safeCustomElement(tag)
export class AltTextWizardButton extends LitElement {
  override connectedCallback() {
    super.connectedCallback();
    this.classList.add(THEME_CLASS);
    initializeLocale().catch(console.error);
  }

  override focus(options?: FocusOptions) {
    this.renderRoot.querySelector('clippy-button')?.shadowRoot?.querySelector('button')?.focus(options);
  }

  override render() {
    return html`
      <clippy-button type="button" purpose="secondary">
        <clippy-icon slot="iconStart">${unsafeSVG(WandIcon)}</clippy-icon>
        ${msg('Alt-text wizard')}
      </clippy-button>
    `;
  }
}
