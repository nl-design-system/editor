import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { descriptionTermShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [descriptionTermShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('descriptionTermShouldNotBeEmpty', () => {
  it('flags an empty term whose description is also empty', () => {
    const [violation] = validate('<dl><dt></dt><dd></dd></dl>');

    expect(violation?.rule).toBe('DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze definitieterm is leeg.');
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

  it('flags every empty term that has no description of its own', () => {
    expect(validate('<dl><dt></dt><dd></dd><dt>term</dt><dd>twee</dd><dt> </dt><dd> </dd></dl>')).toHaveLength(2);
  });

  it('ignores descriptions', () => {
    expect(validate('<dl><dt>term</dt><dd></dd></dl>')).toHaveLength(0);
  });

  it('removes the term when corrected', () => {
    const [violation] = validate('<dl><dt></dt><dd></dd></dl>');
    violation?.correct?.();

    expect(root.querySelector('dt')).toBeNull();
    expect(validator.validate(root)).toHaveLength(0);
  });
});
