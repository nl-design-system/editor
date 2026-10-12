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
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ClippyAltTextWizard } from './ClippyAltTextWizard.ts';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  // CKEditor's focus cycler skips elements without client rects, which jsdom never lays out.
  Element.prototype.getClientRects = function () {
    return [new DOMRect(0, 0, 1, 1)] as unknown as DOMRectList;
  };

  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement, returnValue?: string) {
    if (!this.open) return;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

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

const wizardButtons = (root: ParentNode) => root.querySelectorAll<HTMLElement>('clippy-alt-text-wizard-button');

const wizardDialogs = () => [...document.querySelectorAll<AltTextWizardDialog>('clippy-alt-text-wizard-dialog')];

const isOpen = (dialog: AltTextWizardDialog) =>
  Boolean(dialog.shadowRoot?.querySelector('clippy-modal')?.shadowRoot?.querySelector('dialog')?.open);

const openWizardDialogs = () => wizardDialogs().filter(isOpen);

const innerButton = (button: HTMLElement) =>
  button.shadowRoot!.querySelector('clippy-button')!.shadowRoot!.querySelector('button')!;

type Rendered = HTMLElement & { updateComplete: Promise<unknown> };

const rendered = async (element: HTMLElement) => {
  await (element as Rendered).updateComplete;
  const inner = element.shadowRoot?.querySelector<Rendered>('clippy-button');
  await inner?.updateComplete;
  return element;
};

const openWizard = async (button: HTMLElement) => {
  innerButton(await rendered(button)).click();
  await vi.waitFor(() => expect(openWizardDialogs()).toHaveLength(1));
  return openWizardDialogs()[0];
};

const follows = (node: Node, reference: Node) =>
  Boolean(reference.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);

describe('ClippyAltTextWizard', () => {
  it('puts the Wizard button in its own row directly below the alt input row', async () => {
    const editor = await createEditorWithImage();
    const form = showAltTextForm(editor);

    const [button] = wizardButtons(form);
    const input = form.querySelector('input')!;
    const inputRow = [...form.children].find((child) => child.contains(input))!;

    expect(button).toBeDefined();
    expect(inputRow.nextElementSibling?.contains(button)).toBe(true);
    expect(follows(button, input)).toBe(true);
  });

  it('never adds a second Wizard button when the form is shown again', async () => {
    const editor = await createEditorWithImage();
    const form = showAltTextForm(editor);
    form.querySelector<HTMLElement>('.ck-button-back')!.click();
    showAltTextForm(editor);

    expect(wizardButtons(form)).toHaveLength(1);
  });

  it('opens the wizard dialog when the Wizard button is clicked', async () => {
    const editor = await createEditorWithImage();
    const [button] = wizardButtons(showAltTextForm(editor));
    expect(openWizardDialogs()).toHaveLength(0);

    const dialog = await openWizard(button);

    expect(openWizardDialogs()).toEqual([dialog]);
    expect(dialog.closest('.ck-body-wrapper')).not.toBeNull();
  });

  it('removes its wizard dialog when the editor is destroyed', async () => {
    const editor = await createEditorWithImage();
    await openWizard(wizardButtons(showAltTextForm(editor))[0]);

    await editors.splice(0)[0].destroy();

    expect(wizardDialogs()).toHaveLength(0);
  });

  it("puts the Wizard button between the input and Save/Cancel in Drupal's form", async () => {
    const editor = await createEditorWithImage();
    const view = new View(editor.locale);
    view.setTemplate({
      attributes: {
        class: ['ck', 'ck-text-alternative-form', 'ck-text-alternative-form--with-decorative-toggle'],
      },
      children: [
        { attributes: { class: ['ck', 'ck-button', 'ck-switchbutton'], type: 'button' }, tag: 'button' },
        {
          attributes: { class: ['ck', 'ck-labeled-field-view'] },
          children: [{ attributes: { class: ['ck', 'ck-input'], type: 'text' }, tag: 'input' }],
          tag: 'div',
        },
        { attributes: { class: ['ck', 'ck-button-save'], type: 'submit' }, tag: 'button' },
        { attributes: { class: ['ck', 'ck-button-cancel'], type: 'button' }, tag: 'button' },
      ],
      tag: 'form',
    });
    editor.plugins.get(ContextualBalloon).add({ position: { target: document.body }, view });

    const form = view.element!;
    const [button] = wizardButtons(form);
    expect(button).toBeDefined();
    expect(follows(button, form.querySelector('input')!)).toBe(true);
    expect(follows(form.querySelector('.ck-button-save')!, button)).toBe(true);
    expect(follows(form.querySelector('.ck-button-cancel')!, button)).toBe(true);
  });
});
