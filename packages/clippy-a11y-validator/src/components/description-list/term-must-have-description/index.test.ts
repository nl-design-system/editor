import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { descriptionTermMustHaveDescription } from './index.ts';

let contentRoot: HTMLElement;
const validator = new Validator({ validations: [descriptionTermMustHaveDescription] });

const validate = (html: string) => {
  contentRoot.innerHTML = html;
  return validator.validate([contentRoot]);
};

beforeEach(() => {
  contentRoot = document.createElement('div');
  document.body.replaceChildren(contentRoot);
});

describe('descriptionTermMustHaveDescription', () => {
  it('flags the list holding an empty term whose description has content', () => {
    const [violation] = validate('<dl><dt></dt><dd>beschrijving</dd></dl>');

    expect(violation?.element.tagName).toBe('DL');
    expect(violation?.rule).toBe('DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION');
    expect(violation?.severity).toBe('error');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe(
      'Deze definitielijst heeft een definitiebeschrijving bij een lege definitieterm.',
    );
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

  it('reports a list once, however many of its terms are empty', () => {
    expect(validate('<dl><dt></dt><dd>een</dd><dt> </dt><dd>twee</dd></dl>')).toHaveLength(1);
  });

  it('ignores terms of a nested list', () => {
    expect(validate('<dl><dt>term</dt><dd><dl><dt></dt><dd>genest</dd></dl></dd></dl>')).toHaveLength(1);
  });

  it('ignores elements that are not terms', () => {
    expect(validate('<dl><dd>beschrijving</dd></dl>')).toHaveLength(0);
  });

  it('marks every such term as still to be written when corrected', () => {
    const [violation] = validate('<dl><dt></dt><dd>een</dd><dt>term</dt><dd>twee</dd><dt> </dt><dd>drie</dd></dl>');
    violation?.correct?.();

    expect([...contentRoot.querySelectorAll('dt')].map(({ textContent }) => textContent)).toEqual([
      '...',
      'term',
      '...',
    ]);
    expect(validator.validate([contentRoot])).toHaveLength(0);
  });
});
