import type { AltTextWizardButton } from '@nl-design-system-community/editor/alt-text-wizard';
import { View } from 'ckeditor5';

// Form row wrapping the Wizard button as a CKEditor View, so it can join the form's focus cycling.
export class Row extends View {
  constructor(locale: View['locale']) {
    super(locale);
    this.setTemplate({
      attributes: { class: ['ck', 'ck-form__row', 'clippy-alt-text-wizard-row'] },
      children: [
        {
          children: [{ on: { click: this.bindTemplate.to('execute') }, tag: 'clippy-alt-text-wizard-button' }],
          tag: 'clippy-color-scheme-wrapper',
        },
      ],
      tag: 'div',
    });
  }

  focus(): void {
    this.element?.querySelector<AltTextWizardButton>('clippy-alt-text-wizard-button')?.focus();
  }

  override destroy(): void {
    this.element?.remove();
    super.destroy();
  }
}
