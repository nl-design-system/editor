import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { headingMustNotBeAboveTopLevel } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [headingMustNotBeAboveTopLevel] });

const validate = (html: string, topHeadingLevel?: number) => {
  root.innerHTML = html;
  return validator.validate(root, topHeadingLevel === undefined ? {} : { topHeadingLevel });
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('headingMustNotBeAboveTopLevel', () => {
  it('flags a heading above the document top heading level', () => {
    const [violation] = validate('<h1>Titel</h1>', 2);

    expect(violation?.rule).toBe('HEADING_MUST_NOT_BE_ABOVE_TOP_LEVEL');
    expect(violation?.severity).toBe('error');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe(
      'Kopniveau 1 ligt boven het hoogste kopniveau dat dit document mag gebruiken.',
    );
    expect(violation?.messages.solution).toBe('Gebruik kopniveau 2 of lager.');
  });

  it('accepts a heading at the top heading level', () => {
    expect(validate('<h2>Kop</h2>', 2)).toHaveLength(0);
  });

  it('accepts a heading below the top heading level', () => {
    expect(validate('<h4>Kop</h4>', 2)).toHaveLength(0);
  });

  it('never fires for a standalone document, where no heading can be above level 1', () => {
    expect(validate('<h1>Titel</h1><h2>Kop</h2><h6>Diep</h6>')).toHaveLength(0);
  });

  it('flags every heading that reaches above the top heading level', () => {
    expect(validate('<h1>Een</h1><h2>Twee</h2><h1>Drie</h1>', 3)).toHaveLength(3);
  });

  it('retags the heading to the top heading level when corrected', () => {
    const [violation] = validate('<h1 id="titel">Titel</h1>', 3);
    violation?.correct?.();

    expect(root.innerHTML).toBe('<h3 id="titel">Titel</h3>');
    expect(validator.validate(root, { topHeadingLevel: 3 })).toHaveLength(0);
  });
});
