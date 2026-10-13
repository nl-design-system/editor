import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import WandIcon from '@tabler/icons/outline/wand.svg?raw';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { html, LitElement } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { initializeLocale } from '@/localization';
import { setDarkColorScheme, watchHostColorScheme, THEME_CLASS } from '@/utils/colorScheme';

const tag = 'clippy-alt-text-wizard-button';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: AltTextWizardButton;
  }
}

@localized()
@safeCustomElement(tag)
export class AltTextWizardButton extends LitElement {
  private _unwatchColorScheme: (() => void) | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add(THEME_CLASS);
    this._unwatchColorScheme = watchHostColorScheme(this, (colorScheme) =>
      setDarkColorScheme(colorScheme === 'dark', this),
    );
    initializeLocale().catch(console.error);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._unwatchColorScheme?.();
    this._unwatchColorScheme = null;
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
