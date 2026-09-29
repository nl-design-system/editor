import { ClippyDocument } from '@nl-design-system-community/editor/document';
import { ClassicEditor, Essentials, Heading, Image, Paragraph, type Editor } from 'ckeditor5';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ClippyPlugin } from './ClippyPlugin.ts';

// CKEditor's toolbar observes its own size and scrolls to the selection; jsdom has no layout.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
});

type Validation = Parameters<ClippyDocument['registerValidation']>[0];

const WRONG = 'Fout';

const headingMustNotBeWrong: Validation = {
  condition: (element) => element.textContent !== WRONG,
  correct: (element) => () => {
    element.textContent = 'Goed';
  },
  messages: { nl: { error: 'Kop is fout' } },
  rule: 'heading-must-not-be-wrong',
  scope: 'element',
  selector: 'h2',
  severity: 'error',
};

const validationPass = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
};

let clippyDocument: ClippyDocument;
const editors: Editor[] = [];

beforeEach(() => {
  clippyDocument = new ClippyDocument();
  globalThis.__clippyDocument = clippyDocument;
  clippyDocument.registerValidation(headingMustNotBeWrong);
});

afterEach(async () => {
  await Promise.all(editors.splice(0).map((editor) => editor.destroy()));
  document.body.innerHTML = '';
  globalThis.__clippyDocument = undefined;
});

const createEditor = async (html: string, label?: string): Promise<Editor> => {
  const element = document.createElement('textarea');
  element.id = `editor-${editors.length + 1}`;
  if (label) {
    const labelElement = document.createElement('label');
    labelElement.htmlFor = element.id;
    labelElement.textContent = label;
    document.body.append(labelElement);
  }
  document.body.append(element);

  const editor = await ClassicEditor.create(element, {
    initialData: html,
    licenseKey: 'GPL',
    plugins: [Essentials, Paragraph, Heading, Image, ClippyPlugin],
  });
  editors.push(editor);
  await validationPass();
  return editor;
};

const destroyEditor = async (editor: Editor) => {
  editors.splice(editors.indexOf(editor), 1);
  await editor.destroy();
  await validationPass();
};

const imageMustHaveAlt: Validation = {
  condition: (element) => Boolean(element.getAttribute('alt')),
  messages: { nl: { error: 'Afbeelding heeft geen alt' } },
  rule: 'image-must-have-alt',
  scope: 'element',
  selector: 'img',
  severity: 'error',
};

const editableOf = (editor: Editor) => editor.ui.getEditableElement()!;

const clippyButtonOf = (editor: Editor) =>
  editor.ui.element!.querySelector<HTMLButtonElement>('.ck-toolbar .clippy-ckeditor-button')!;

const sharedPanel = () => document.querySelector('clippy-panel')!;

const isOn = (editor: Editor) => clippyButtonOf(editor).classList.contains('ck-on');

const contentOf = (editor: Editor) => {
  const container = document.createElement('div');
  container.innerHTML = editor.getData();
  return [...container.children].map((element) => `${element.localName}:${element.textContent}`);
};

describe('ClippyPlugin', () => {
  it('registers the editable as a source labelled after the field', async () => {
    const editor = await createEditor(`<h2>${WRONG}</h2>`, 'Inhoud');

    expect(clippyDocument.violations).toEqual([
      expect.objectContaining({ label: 'Inhoud', rule: headingMustNotBeWrong.rule }),
    ]);
    expect(editableOf(editor).contains(clippyDocument.violations[0].element)).toBe(true);
  });

  it('falls back to a generic label when the field has none', async () => {
    await createEditor(`<h2>${WRONG}</h2>`);

    expect(clippyDocument.violations.map(({ label }) => label)).toEqual(['Editor']);
  });

  it('is revalidated by the document when the content changes', async () => {
    const editor = await createEditor('<h2>Goed</h2>');
    expect(clippyDocument.violations).toEqual([]);

    editor.setData(`<h2>${WRONG}</h2>`);
    await validationPass();

    expect(clippyDocument.violations.map(({ rule }) => rule)).toEqual([headingMustNotBeWrong.rule]);
  });

  it('unregisters when the editor is destroyed', async () => {
    const editor = await createEditor(`<h2>${WRONG}</h2>`);

    await destroyEditor(editor);

    expect(clippyDocument.violations).toEqual([]);
  });

  it('opens the shared panel filtered to its own source from the Clippy button', async () => {
    const editor = await createEditor(`<h2>${WRONG}</h2>`);
    const panel = sharedPanel();
    expect(panel.hidden).toBe(true);
    expect(editor.ui.element!.contains(panel)).toBe(false);

    clippyButtonOf(editor).click();

    expect(panel.hidden).toBe(false);
    expect(panel.source).toBe(clippyDocument.violations[0].source);
    expect(panel.clippyDocument).toBe(clippyDocument);
    expect(isOn(editor)).toBe(true);

    clippyButtonOf(editor).click();

    expect(panel.hidden).toBe(true);
    expect(isOn(editor)).toBe(false);
  });

  it('switches the shared panel to the editor whose Clippy button was pressed', async () => {
    const first = await createEditor(`<h2>${WRONG}</h2>`, 'Samenvatting');
    const second = await createEditor(`<h2>${WRONG}</h2>`, 'Inhoud');
    const [, secondViolation] = clippyDocument.violations;
    expect(document.querySelectorAll('clippy-panel')).toHaveLength(1);

    clippyButtonOf(first).click();
    clippyButtonOf(second).click();
    await validationPass();

    expect(sharedPanel().hidden).toBe(false);
    expect(sharedPanel().source).toBe(secondViolation.source);
    expect([isOn(first), isOn(second)]).toEqual([false, true]);
  });

  it('removes the shared panel once the last editor is destroyed', async () => {
    const first = await createEditor(`<h2>${WRONG}</h2>`);
    const second = await createEditor(`<h2>${WRONG}</h2>`);
    clippyButtonOf(first).click();

    await destroyEditor(first);

    expect(sharedPanel().hidden).toBe(true);

    await destroyEditor(second);

    expect(document.querySelector('clippy-panel')).toBeNull();
  });

  it('counts its own violations on the Clippy button', async () => {
    const editor = await createEditor(`<h2>${WRONG}</h2><h2>${WRONG}</h2>`);
    await createEditor(`<h2>${WRONG}</h2>`);

    expect(clippyButtonOf(editor).textContent).toContain('Clippy (2)');

    editor.setData('<h2>Goed</h2>');
    await validationPass();

    expect(clippyButtonOf(editor).textContent).not.toContain('(');
  });

  it('selects a flagged image when its violation is focused', async () => {
    clippyDocument.registerValidation(imageMustHaveAlt);
    const editor = await createEditor('<p>Tekst</p><figure class="image"><img src="a.png"></figure>');

    clippyDocument.dispatch({ type: 'focus', violation: clippyDocument.violations[0] });

    expect(editor.model.document.selection.getSelectedElement()?.name).toBe('imageBlock');
  });

  it('keeps widgets intact when a correction is applied beside them', async () => {
    const editor = await createEditor(`<h2>${WRONG}</h2><figure class="image"><img src="a.png" alt="Foto"></figure>`);

    clippyDocument.dispatch({ type: 'correct', violation: clippyDocument.violations[0] });

    expect(contentOf(editor)).toEqual(['h2:Goed', 'figure:']);
    expect(editor.getData()).toContain('alt="Foto"');
  });

  it('moves the selection into the flagged content when a violation is focused', async () => {
    const editor = await createEditor(`<h2>Goed</h2><h2>${WRONG}</h2>`);

    clippyDocument.dispatch({ type: 'focus', violation: clippyDocument.violations[0] });

    const position = editor.model.document.selection.getFirstPosition()!;
    const root = editor.model.document.getRoot()!;
    expect(position.parent).toBe(root.getChild(1));
  });

  it('corrects the flagged element through the editor model', async () => {
    const editor = await createEditor(`<h2>${WRONG}</h2><p>Tekst</p><h2>${WRONG}</h2>`);
    const [, second] = clippyDocument.violations;

    clippyDocument.dispatch({ type: 'correct', violation: second });

    expect(contentOf(editor)).toEqual([`h2:${WRONG}`, 'p:Tekst', 'h2:Goed']);
    editor.execute('undo');
    expect(contentOf(editor)).toEqual([`h2:${WRONG}`, 'p:Tekst', `h2:${WRONG}`]);
  });

  it('keeps a correction that replaces the flagged element', async () => {
    clippyDocument.registerValidation({
      ...headingMustNotBeWrong,
      correct: (element: HTMLElement) => () => {
        const replacement = element.ownerDocument.createElement('h3');
        replacement.append(...element.childNodes);
        element.replaceWith(replacement);
      },
    });
    const editor = await createEditor(`<h2>${WRONG}</h2>`);

    clippyDocument.dispatch({ type: 'correct', violation: clippyDocument.violations[0] });

    expect(contentOf(editor)).toEqual([`h3:${WRONG}`]);
  });

  it('registers each editor on a page as its own source', async () => {
    const first = await createEditor(`<h2>${WRONG}</h2>`, 'Samenvatting');
    await createEditor(`<h2>${WRONG}</h2>`, 'Inhoud');

    const [a, b] = clippyDocument.violations;
    expect([a.label, b.label]).toEqual(['Samenvatting', 'Inhoud']);
    expect(a.source).not.toBe(b.source);

    await destroyEditor(first);

    expect(clippyDocument.violations).toEqual([expect.objectContaining({ label: 'Inhoud', source: b.source })]);
  });
});
