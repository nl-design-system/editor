import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerHeadingSource } from './headingSource';
import { ClippyDocument } from './index';

const { HEADING_LEVEL_MUST_NOT_SKIP, HEADING_MUST_NOT_BE_EMPTY, HEADING_MUST_START_AT_LEVEL_ONE } = coreValidationRules;

const validationPass = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
};

const createInput = (value: string) => {
  const input = document.createElement('input');
  input.value = value;
  document.body.append(input);
  return input;
};

const createEditor = (html: string) => {
  const editable = document.createElement('div');
  editable.innerHTML = html;
  document.body.append(editable);
  return { anchor: editable, fragment: editable, label: 'Body' };
};

const reported = (clippyDocument: ClippyDocument) =>
  clippyDocument.violations.map(({ element, rule }) => ({ element, rule }));

let clippyDocument: ClippyDocument;

beforeEach(() => {
  document.body.replaceChildren();
  clippyDocument = new ClippyDocument();
  [HEADING_LEVEL_MUST_NOT_SKIP, HEADING_MUST_NOT_BE_EMPTY, HEADING_MUST_START_AT_LEVEL_ONE].forEach((rule) =>
    clippyDocument.registerValidation(coreValidations[rule]),
  );
});

describe('registerHeadingSource', () => {
  it('sorts the heading into document order by its input', async () => {
    const editor = createEditor('<h2>Voorwaarden</h2>');
    clippyDocument.register(editor);
    const input = createInput('Paspoort aanvragen');
    editor.anchor.before(input);

    registerHeadingSource(clippyDocument, { input, label: 'Title', level: 1 });
    await validationPass();

    expect(clippyDocument.violations).toEqual([]);
  });

  it('reports an editor that starts too deep below the heading', async () => {
    registerHeadingSource(clippyDocument, { input: createInput('Paspoort aanvragen'), label: 'Title', level: 1 });
    const editor = createEditor('<h3>Voorwaarden</h3>');
    clippyDocument.register(editor);
    await validationPass();

    expect(reported(clippyDocument)).toEqual([
      { element: editor.fragment.querySelector('h3'), rule: HEADING_LEVEL_MUST_NOT_SKIP },
    ]);
  });

  it('stands in for a heading at the level it is given', async () => {
    registerHeadingSource(clippyDocument, { input: createInput('Paspoort aanvragen'), label: 'Title', level: 1 });
    registerHeadingSource(clippyDocument, { input: createInput('Voorwaarden'), label: 'Section', level: 2 });
    clippyDocument.register(createEditor('<h3>Leeftijd</h3>'));
    await validationPass();

    expect(clippyDocument.violations).toEqual([]);
  });

  it('follows the input value with the same proxy element', async () => {
    const input = createInput('');
    registerHeadingSource(clippyDocument, { input, label: 'Title', level: 1 });
    await validationPass();
    const [{ element: proxy }] = clippyDocument.violations;

    input.value = 'Paspoort aanvragen';
    input.dispatchEvent(new Event('input'));
    await validationPass();
    expect(clippyDocument.violations).toEqual([]);

    input.value = '';
    input.dispatchEvent(new Event('input'));
    await validationPass();
    expect(reported(clippyDocument)).toEqual([{ element: proxy, rule: HEADING_MUST_NOT_BE_EMPTY }]);
  });
});
