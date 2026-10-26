import type { AltTextWizardDialog } from '@nl-design-system-community/editor/alt-text-wizard';
import {
  ClassicEditor,
  ContextualBalloon,
  Essentials,
  Image,
  ImageTextAlternative,
  Paragraph,
  View,
  type Editor,
} from 'ckeditor5';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { ClippyAltTextWizard } from './ClippyAltTextWizard.ts';

const editors: Editor[] = [];

afterEach(async () => {
  await Promise.all(editors.splice(0).map((editor) => editor.destroy()));
  document.body.innerHTML = '';
});

const createEditor = async (plugins = [Essentials, Paragraph, Image, ImageTextAlternative, ClippyAltTextWizard]) => {
  const element = document.createElement('div');
  document.body.append(element);
  const editor = await ClassicEditor.create(element, { licenseKey: 'GPL', plugins });
  editors.push(editor);
  return editor;
};

const createEditorWithImage = async (alt = '') => {
  const editor = await createEditor();
  editor.setData(`<figure class="image"><img src="image.png" alt="${alt}"></figure>`);
  editor.model.change((writer) => {
    writer.setSelection(editor.model.document.getRoot()!.getChild(0)!, 'on');
  });
  return editor;
};

const showAltTextForm = (editor: Editor) => {
  editor.ui.componentFactory.create('imageTextAlternative').fire('execute');
  return balloonElement(editor).querySelector<HTMLElement>('.ck-text-alternative-form')!;
};

const balloonElement = (editor: Editor) => editor.plugins.get(ContextualBalloon).view.element!;

const wizardButton = () => page.getByRole('button', { name: 'Alt-text wizard' });

const wizardDialog = () => page.getByRole('dialog', { name: 'Alt-text wizard', includeHidden: true });

const wizardDialogHosts = () => document.querySelectorAll<AltTextWizardDialog>('clippy-alt-text-wizard-dialog');

const openWizard = async () => {
  await wizardButton().click();
  await expect.element(wizardDialog()).toHaveAttribute('open');
};

const altInput = (form: HTMLElement) => form.querySelector<HTMLInputElement>('input.ck-input')!;

const typeDraft = (form: HTMLElement, value: string) => {
  const input = altInput(form);
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

describe('ClippyAltTextWizard', () => {
  it('puts the Wizard button in its own row directly below the alt input row', async () => {
    const editor = await createEditorWithImage();
    const form = showAltTextForm(editor);

    const input = form.querySelector('input')!;
    const inputRow = [...form.children].find((child) => child.contains(input))!;

    await expect.element(wizardButton()).toBeVisible();
    const row = inputRow.nextElementSibling!.getBoundingClientRect();
    const button = wizardButton().element().getBoundingClientRect();
    expect(button.top).toBeGreaterThanOrEqual(row.top);
    expect(button.bottom).toBeLessThanOrEqual(row.bottom);
  });

  it('never adds a second Wizard button when the form is shown again', async () => {
    const editor = await createEditorWithImage();
    const form = showAltTextForm(editor);
    form.querySelector<HTMLElement>('.ck-button-back')!.click();
    showAltTextForm(editor);

    await expect.element(wizardButton()).toBeVisible();
  });

  it('opens the wizard dialog when the Wizard button is clicked', async () => {
    const editor = await createEditorWithImage();
    showAltTextForm(editor);
    await expect.element(wizardDialog()).not.toBeInTheDocument();

    await openWizard();

    expect(wizardDialogHosts()).toHaveLength(1);
    expect(wizardDialogHosts()[0].closest('.ck-body-wrapper')).not.toBeNull();
  });

  it('follows the color scheme of the page around the editor with the Wizard button and dialog', async () => {
    const editor = await createEditorWithImage();
    const form = showAltTextForm(editor);

    expect(form.querySelector('clippy-color-scheme-wrapper clippy-alt-text-wizard-button')).not.toBeNull();

    await openWizard();
    expect(wizardDialogHosts()[0].closest('clippy-color-scheme-wrapper')).not.toBeNull();
  });

  it('removes its wizard dialog when the editor is destroyed', async () => {
    const editor = await createEditorWithImage();
    showAltTextForm(editor);
    await openWizard();

    await editors.splice(0)[0].destroy();

    expect(wizardDialogHosts()).toHaveLength(0);
  });

  it('hides the Alt-text form without saving and moves focus into the wizard when it opens', async () => {
    const editor = await createEditorWithImage('Saved');
    const form = showAltTextForm(editor);
    typeDraft(form, 'Draft');

    await openWizard();

    expect(form.isConnected).toBe(false);
    expect(editor.getData()).toContain('alt="Saved"');
    expect(document.activeElement).toBe(wizardDialogHosts()[0]);
  });

  it('shows the Alt-text form again with the draft and focus on the input when the wizard closes', async () => {
    const editor = await createEditorWithImage('Saved');
    const form = showAltTextForm(editor);
    typeDraft(form, 'Draft');
    await openWizard();

    wizardDialogHosts()[0].close();

    await expect.element(wizardDialog()).not.toHaveAttribute('open');
    await expect.poll(() => balloonElement(editor).contains(form)).toBe(true);
    expect(altInput(form).value).toBe('Draft');
    expect(document.activeElement).toBe(altInput(form));
    expect(editor.getData()).toContain('alt="Saved"');
  });

  it('should not add an alt-text wizard to other balloon views', async () => {
    const editor = await createEditorWithImage();
    const view = new View(editor.locale);
    view.setTemplate({
      children: [{ attributes: { class: ['ck', 'ck-input'], type: 'text' }, tag: 'input' }],
      tag: 'form',
    });

    editor.plugins.get(ContextualBalloon).add({ position: { target: document.body }, view });

    expect(wizardButton().query()).toBeNull();
  });
});
