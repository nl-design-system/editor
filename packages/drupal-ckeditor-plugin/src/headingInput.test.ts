import {
  ClippyDocument,
  coreValidationRules,
  coreValidations,
  type DocumentViolation,
} from '@nl-design-system-community/ckeditor-plugin';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerHeadingInput } from './headingInput.ts';

const { HEADING_LEVEL_MUST_NOT_SKIP, HEADING_MUST_NOT_BE_EMPTY } = coreValidationRules;

const validationPass = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
};

const addHeadingInput = (label: string, level: string, value: string) => {
  const input = document.createElement('input');
  input.id = `heading-${document.body.children.length}`;
  input.dataset['clippyHeadingLevel'] = level;
  input.value = value;
  const labelElement = document.createElement('label');
  labelElement.htmlFor = input.id;
  labelElement.textContent = label;
  document.body.append(labelElement, input);
  return input;
};

const addEditor = (label: string, html: string) => {
  const editable = document.createElement('div');
  editable.innerHTML = html;
  document.body.append(editable);
  clippyDocument.register({ anchor: editable, fragment: editable, label });
  return editable;
};

const reported = (violations: readonly DocumentViolation[]) =>
  violations.map(({ element, label, rule }) => ({ element, label, rule }));

let clippyDocument: ClippyDocument;

beforeEach(() => {
  document.body.replaceChildren();
  clippyDocument = new ClippyDocument();
  Object.values(coreValidations).forEach((validation) => clippyDocument.registerValidation(validation));
});

describe('registerHeadingInput', () => {
  it('stands in for a heading at the level the input is marked with', async () => {
    registerHeadingInput(addHeadingInput('Title', '1', 'Paspoort aanvragen'), clippyDocument);
    registerHeadingInput(addHeadingInput('Section title', '2', 'Voorwaarden'), clippyDocument);
    addEditor('Text', '<h3>Leeftijd</h3>');
    await validationPass();

    expect(clippyDocument.violations).toEqual([]);
  });

  it('reports a level skipped below the heading it stands in for', async () => {
    registerHeadingInput(addHeadingInput('Title', '1', 'Paspoort aanvragen'), clippyDocument);
    registerHeadingInput(addHeadingInput('Section title', '2', 'Voorwaarden'), clippyDocument);
    const text = addEditor('Text', '<h4>Leeftijd</h4>');
    await validationPass();

    expect(reported(clippyDocument.violations)).toEqual([
      { element: text.querySelector('h4'), label: 'Text', rule: HEADING_LEVEL_MUST_NOT_SKIP },
    ]);
  });

  it('reports an empty heading under the label of its input', async () => {
    registerHeadingInput(addHeadingInput('Title', '1', 'Paspoort aanvragen'), clippyDocument);
    registerHeadingInput(addHeadingInput('Section title', '2', ''), clippyDocument);
    await validationPass();

    expect(reported(clippyDocument.violations)).toEqual([
      {
        element: expect.objectContaining({ tagName: 'H2' }),
        label: 'Section title',
        rule: HEADING_MUST_NOT_BE_EMPTY,
      },
    ]);
  });

  it('ignores an input marked with a level that is not a heading level', async () => {
    const input = addHeadingInput('Section title', '7', '');

    registerHeadingInput(input, clippyDocument);
    await validationPass();

    expect(clippyDocument.violations).toEqual([]);
  });

  it('takes the heading out of the report when unregistered', async () => {
    registerHeadingInput(addHeadingInput('Title', '1', 'Paspoort aanvragen'), clippyDocument);
    const unregister = registerHeadingInput(addHeadingInput('Section title', '2', ''), clippyDocument);
    await validationPass();

    unregister();
    await validationPass();

    expect(clippyDocument.violations).toEqual([]);
  });
});
