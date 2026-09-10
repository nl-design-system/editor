import { describe, expect, it } from 'vitest';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { descriptionTermMustHaveDescription } from './index.ts';

const { fragment, validate, validator } = initializeRuleTest([descriptionTermMustHaveDescription]);

describe('descriptionTermMustHaveDescription', () => {
  it('flags a list holding an empty term whose description has content', () => {
    const [violation] = validate('<dl><dt></dt><dd>beschrijving</dd></dl>');

    expect(violation?.rule).toBe('DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION');
    expect(violation?.severity).toBe('error');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe('Deze definitielijst heeft een beschrijving bij een lege definitieterm.');

    expect(violation?.element.tagName).toBe('DL');
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

  it('reports one violation for a list however many of its terms are unnamed', () => {
    expect(validate('<dl><dt></dt><dd>een</dd><dt></dt><dd>twee</dd></dl>')).toHaveLength(1);
  });

  it('reports a nested list separately from the list holding it', () => {
    expect(validate('<dl><dt></dt><dd>een<dl><dt></dt><dd>twee</dd></dl></dd></dl>')).toHaveLength(2);
  });

  it('marks every unnamed term as still to be written when corrected', () => {
    const [violation] = validate('<dl><dt></dt><dd>een</dd><dt></dt><dd>twee</dd></dl>');
    violation?.correct?.();

    expect([...fragment.querySelectorAll('dt')].map(({ textContent }) => textContent)).toEqual(['...', '...']);
    expect(validator.validate([fragment])).toHaveLength(0);
  });
});
