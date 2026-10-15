import type { ClippyModal } from '@nl-design-system-community/clippy-components/clippy-modal';
import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import '@nl-design-system-community/clippy-alt-text-wizard';
import '@nl-design-system-community/clippy-components/clippy-modal';
import { html, LitElement } from 'lit';
import { query } from 'lit/decorators.js';
import { initializeLocale } from '@/localization';
import { setDarkColorScheme, watchHostColorScheme, THEME_CLASS } from '@/utils/colorScheme';

const tag = 'clippy-alt-text-wizard-dialog';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: AltTextWizardDialog;
  }
}

@localized()
@safeCustomElement(tag)
export class AltTextWizardDialog extends LitElement {
  @query('clippy-modal')
  private readonly modal!: ClippyModal;

  private _unwatchColorScheme: (() => void) | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add(THEME_CLASS, 'clippy-theme', 'utrecht-theme');
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

  async open(): Promise<void> {
    await this.updateComplete;
    this.modal.replaceChildren(document.createElement('clippy-alt-text-wizard'));
    this.modal.open();
  }

  close(): void {
    this.modal?.close();
  }

  override render() {
    return html`<clippy-modal .title=${msg('Alt-text wizard')} actions="none"></clippy-modal>`;
  }
}
