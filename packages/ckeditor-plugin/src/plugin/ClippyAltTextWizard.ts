import type { AltTextWizardButton, AltTextWizardDialog } from '@nl-design-system-community/editor/alt-text-wizard';
import '@nl-design-system-community/editor/alt-text-wizard';
import '@nl-design-system-community/editor/color-scheme';
import {
  ContextualBalloon,
  Plugin,
  View,
  type ModelElement,
  type ObservableChangeEvent,
  type ViewCollection,
} from 'ckeditor5';

const ALT_TEXT_FORM_CLASS = 'ck-text-alternative-form';
const ALT_INPUT_SELECTOR = 'input.ck-input';

type AltTextFormView = View & {
  focusTracker?: { add(element: Element): void; remove(element: Element): void };
  _focusables?: ViewCollection;
};

const altInput = (form: View) => form.element!.querySelector<HTMLInputElement>(ALT_INPUT_SELECTOR);

// Form row wrapping the Wizard button as a CKEditor View, so it can join the form's focus cycling.
class WizardRowView extends View {
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

// Wizard dialog element as a CKEditor View, so it can live in the editor's body collection and be cleaned up with the editor.
class WizardDialogView extends View {
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

// Adds a Wizard button to the image alt-text balloon form (CKEditor's or Drupal's) that opens the alt-text wizard dialog.
export class ClippyAltTextWizard extends Plugin {
  static get pluginName() {
    return 'ClippyAltTextWizard' as const;
  }

  private readonly _rows = new Map<View, WizardRowView>();
  private _dialog: WizardDialogView | null = null;
  private _altTextForm: { draft: string; form: AltTextFormView; image: ModelElement | null } | null = null;

  afterInit(): void {
    if (!this.editor.plugins.has(ContextualBalloon) || !this.editor.commands.get('imageTextAlternative')) {
      return;
    }

    this.listenTo<ObservableChangeEvent<View | null>>(
      this.editor.plugins.get(ContextualBalloon),
      'change:visibleView',
      (_evt, _name, view) => {
        if (view?.element?.classList.contains(ALT_TEXT_FORM_CLASS)) {
          this._addWizardButton(view as AltTextFormView);
        }
      },
    );
  }

  override destroy(): void {
    for (const row of this._rows.values()) {
      row.destroy();
    }
    this._rows.clear();
    super.destroy();
  }

  private _openWizard(form: AltTextFormView): void {
    this._altTextForm = { draft: altInput(form)!.value, form, image: this._selectedImage() };
    // close the form before the modal opens, so the editor regaining focus does not pull focus out of the modal
    form.fire('cancel');
    if (!this._dialog) {
      this._dialog = new WizardDialogView(this.editor.locale);
      this.editor.ui.view.body.add(this._dialog);
      this.listenTo(this._dialog, 'close', () => this._restoreForm());
    }
    this._dialog.dialog.open();
  }

  private _selectedImage(): ModelElement | null {
    return this.editor.plugins.get('ImageUtils').getClosestSelectedImageElement(this.editor.model.document.selection);
  }

  private _restoreForm(): void {
    const altTextForm = this._altTextForm;
    this._altTextForm = null;
    const selectedImage = this._selectedImage();
    if (!altTextForm || !selectedImage || selectedImage !== altTextForm.image) {
      return;
    }

    const { draft, form } = altTextForm;
    const balloon = this.editor.plugins.get(ContextualBalloon);
    if (balloon.hasView(form)) {
      return;
    }

    const view = this.editor.editing.view;
    balloon.add({
      position: { target: view.domConverter.mapViewToDom(this.editor.editing.mapper.toViewElement(selectedImage)!) },
      view: form,
    });

    const input = altInput(form)!;
    input.value = draft;
    input.dispatchEvent(new Event('input'));
    input.focus();
  }

  private _addWizardButton(form: AltTextFormView): void {
    const formElement = form.element!;
    const input = altInput(form);
    if (!input || this._rows.has(form)) {
      return;
    }

    // the direct child of the form that holds the input
    const inputRow = [...formElement.children].find((child) => child.contains(input));
    if (!inputRow) {
      return;
    }

    const row = new WizardRowView(this.editor.locale);
    row.render();
    this.listenTo(row, 'execute', () => this._openWizard(form));
    // place the row directly below the input, above Save/Cancel
    inputRow.after(row.element!);
    // remember the row, so it is added once per form and destroyed with the plugin
    this._rows.set(form, row);

    // focus on the Wizard button counts as focus inside the form
    form.focusTracker?.add(row.element!);
    // ordered list of Views that Tab cycles through
    const focusables = form._focusables;
    if (focusables) {
      const inRow = [...focusables].map((focusable) => inputRow.contains(focusable.element ?? null));
      // index of the last focusable in the input row
      const lastInRowIndex = inRow.lastIndexOf(true);
      // insert the Wizard row right after it, or at the end if none was found
      focusables.add(row, lastInRowIndex === -1 ? undefined : lastInRowIndex + 1);
    }
  }
}
