import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { descriptionListMustContainTerm } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [descriptionListMustContainTerm] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('descriptionListMustContainTerm', () => {
  it('flags a list whose only term is empty', () => {
    const [violation] = validate('<dl><dt></dt><dd>beschrijving</dd></dl>');

    expect(violation?.rule).toBe('DESCRIPTION_LIST_MUST_CONTAIN_TERM');
    expect(violation?.severity).toBe('error');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze definitielijst heeft geen definitieterm.');
  });

  it('flags a list where every term is empty', () => {
    expect(validate('<dl><dt></dt><dd>een</dd><dt> </dt><dd>twee</dd></dl>')).toHaveLength(1);
  });

  it('accepts a list where at least one term has text', () => {
    expect(validate('<dl><dt></dt><dd>een</dd><dt>term</dt><dd>twee</dd></dl>')).toHaveLength(0);
  });

  it('accepts a list without any terms', () => {
    expect(validate('<dl></dl>')).toHaveLength(0);
  });

  it('looks through a wrapper element around the pairs', () => {
    expect(validate('<dl><div class="item"><dt></dt><dd>beschrijving</dd></div></dl>')).toHaveLength(1);
  });

  it('only counts terms belonging to the list itself', () => {
    expect(validate('<dl><dt></dt><dd><dl><dt>genest</dt><dd>beschrijving</dd></dl></dd></dl>')).toHaveLength(1);
  });

  it('reports each offending list separately', () => {
    expect(
      validate('<dl><dt></dt><dd>een</dd></dl><dl><dt>term</dt><dd>twee</dd></dl><dl><dt></dt><dd>drie</dd></dl>'),
    ).toHaveLength(2);
  });

  it('ignores elements that are not description lists', () => {
    expect(validate('<ul><li>item</li></ul>')).toHaveLength(0);
  });

  it('marks the first empty term as still to be written when corrected', () => {
    const [violation] = validate('<dl><dt></dt><dd>beschrijving</dd></dl>');
    violation?.correct?.();

    expect(root.querySelector('dt')?.textContent).toBe('...');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
