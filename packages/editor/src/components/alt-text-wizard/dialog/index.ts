import type { ClippyModal } from '@nl-design-system-community/clippy-components/clippy-modal';
import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import '@nl-design-system-community/clippy-alt-text-wizard';
import '@nl-design-system-community/clippy-components/clippy-modal';
import { html, LitElement } from 'lit';
import { query } from 'lit/decorators.js';
import { initializeLocale } from '@/localization';

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

  override connectedCallback() {
    super.connectedCallback();
    initializeLocale().catch(console.error);
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
