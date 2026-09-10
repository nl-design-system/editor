import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { descriptionTermShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [descriptionTermShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate([root]);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('descriptionTermShouldNotBeEmpty', () => {
  it('flags the list holding an empty term whose description is also empty', () => {
    const [violation] = validate('<dl><dt></dt><dd></dd></dl>');

    expect(violation?.element.tagName).toBe('DL');
    expect(violation?.rule).toBe('DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe('Deze definitielijst heeft een lege definitieterm.');
    expect(violation?.messages.solution).toBe('Verwijder de lege definitieterm of voeg tekst toe.');
  });

  it('flags an empty term that is not followed by a description', () => {
    expect(validate('<dl><dt></dt><dt>term</dt><dd>beschrijving</dd></dl>')).toHaveLength(1);
  });

  it('flags an empty term that is the last element', () => {
    expect(validate('<dl><dt>term</dt><dd>beschrijving</dd><dt></dt></dl>')).toHaveLength(1);
  });

  it('flags a term holding only whitespace', () => {
    expect(validate('<dl><dt> </dt></dl>')).toHaveLength(1);
  });

  it('leaves an empty term with a filled description to the rule that fills it in', () => {
    expect(validate('<dl><dt></dt><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('accepts a term with text', () => {
    expect(validate('<dl><dt>term</dt><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('reports a list once, however many of its terms are empty', () => {
    expect(validate('<dl><dt></dt><dd></dd><dt>term</dt><dd>twee</dd><dt> </dt><dd> </dd></dl>')).toHaveLength(1);
  });

  it('ignores terms of a nested list', () => {
    expect(validate('<dl><dt>term</dt><dd><dl><dt></dt></dl></dd></dl>')).toHaveLength(1);
  });

  it('ignores descriptions', () => {
    expect(validate('<dl><dt>term</dt><dd></dd></dl>')).toHaveLength(0);
  });

  it('removes every such term when corrected', () => {
    const [violation] = validate('<dl><dt></dt><dd></dd><dt>term</dt><dd>twee</dd><dt></dt></dl>');
    violation?.correct?.();

    expect([...root.querySelectorAll('dt')].map(({ textContent }) => textContent)).toEqual(['term']);
    expect(validator.validate([root])).toHaveLength(0);
  });
});
