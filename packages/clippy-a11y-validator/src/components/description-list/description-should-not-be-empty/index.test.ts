import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { descriptionShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [descriptionShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('descriptionShouldNotBeEmpty', () => {
  it('flags an empty description', () => {
    const [violation] = validate('<dl><dt>term</dt><dd></dd></dl>');

    expect(violation?.rule).toBe('DESCRIPTION_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze definitiebeschrijving is leeg.');
    expect(violation?.messages.solution).toBe('Verwijder de lege definitiebeschrijving of voeg tekst toe.');
  });

  it('flags a description holding only whitespace', () => {
    expect(validate('<dl><dt>term</dt><dd> </dd></dl>')).toHaveLength(1);
  });

  it('flags every empty description', () => {
    expect(
      validate('<dl><dt>een</dt><dd></dd><dt>twee</dt><dd>beschrijving</dd><dt>drie</dt><dd> </dd></dl>'),
    ).toHaveLength(2);
  });

  it('accepts a description with text', () => {
    expect(validate('<dl><dt>term</dt><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('ignores terms', () => {
    expect(validate('<dl><dt></dt><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('removes the description when corrected', () => {
    const [violation] = validate('<dl><dt>term</dt><dd></dd></dl>');
    violation?.correct?.();

    expect(root.querySelector('dd')).toBeNull();
    expect(validator.validate(root)).toHaveLength(0);
  });
});
