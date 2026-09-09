import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { descriptionTermMustHaveDescription } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [descriptionTermMustHaveDescription] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('descriptionTermMustHaveDescription', () => {
  it('flags an empty term whose description has content', () => {
    const [violation] = validate('<dl><dt></dt><dd>beschrijving</dd></dl>');

    expect(violation?.rule).toBe('DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION');
    expect(violation?.severity).toBe('error');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze definitiebeschrijving hoort bij een lege definitieterm.');
  });

  it('flags a term holding only whitespace', () => {
    expect(validate('<dl><dt> </dt><dd>beschrijving</dd></dl>')).toHaveLength(1);
  });

  it('accepts a term with text', () => {
    expect(validate('<dl><dt>term</dt><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('accepts an empty term whose description is also empty', () => {
    expect(validate('<dl><dt></dt><dd></dd></dl>')).toHaveLength(0);
  });

  it('accepts an empty term that is not followed by a description', () => {
    expect(validate('<dl><dt></dt><dt>term</dt><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('accepts an empty term that is the last element', () => {
    expect(validate('<dl><dt>term</dt><dd>beschrijving</dd><dt></dt></dl>')).toHaveLength(0);
  });

  it('works inside a wrapper element around the pair', () => {
    expect(validate('<dl><div class="item"><dt></dt><dd>beschrijving</dd></div></dl>')).toHaveLength(1);
  });

  it('ignores elements that are not terms', () => {
    expect(validate('<dl><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('marks the term as still to be written when corrected', () => {
    const [violation] = validate('<dl><dt></dt><dd>beschrijving</dd></dl>');
    violation?.correct?.();

    expect(root.querySelector('dt')?.textContent).toBe('...');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
