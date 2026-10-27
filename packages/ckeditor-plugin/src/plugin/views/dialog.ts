import type { AltTextWizardDialog } from '@nl-design-system-community/editor/alt-text-wizard';
import { View } from 'ckeditor5';

// Wizard dialog element as a CKEditor View, so it can live in the editor's body collection and be cleaned up with the editor.
export class Dialog extends View {
  constructor(locale: View['locale']) {
    super(locale);
    this.setTemplate({
      attributes: { class: ['ck-reset_all-excluded'] },
      children: [{ on: { close: this.bindTemplate.to('close') }, tag: 'clippy-alt-text-wizard-dialog' }],
      tag: 'clippy-color-scheme-wrapper',
    });
  }

  get dialog(): AltTextWizardDialog {
    return this.element!.firstElementChild as AltTextWizardDialog;
  }
}
