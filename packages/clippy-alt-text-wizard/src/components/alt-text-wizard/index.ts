import { localized, msg } from '@lit/localize';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import { LitElement, html, unsafeCSS } from 'lit';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { initializeLocale } from '@/localization.ts';

const tag = 'clippy-alt-text-wizard';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ClippyAltTextWizard;
  }
}

/**
 * @summary Guides authors through writing accessible alt text for images.
 * @tag clippy-alt-text-wizard
 */
@localized()
@safeCustomElement(tag)
export class ClippyAltTextWizard extends LitElement {
  static override readonly styles = unsafeCSS(headingStyle);

  override connectedCallback() {
    super.connectedCallback();
    initializeLocale().then(() => {
      this.requestUpdate();
    });
  }

  override render() {
    return html`<h1 class="nl-heading nl-heading--level-1">${msg('Alt-text wizard')}</h1>`;
  }
}
