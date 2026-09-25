import { describe, expect, it } from 'vitest';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { descriptionTermShouldNotBeEmpty } from './index.ts';

const { fragment, validate, validator } = initializeRuleTest([descriptionTermShouldNotBeEmpty]);

describe('descriptionTermShouldNotBeEmpty', () => {
  it('flags a list holding an empty term whose description is also empty', () => {
    const [violation] = validate('<dl><dt></dt><dd></dd></dl>');

    expect(violation?.rule).toBe('DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe('Deze definitielijst bevat een lege definitieterm.');
    expect(violation?.messages.solution).toBe('Verwijder de lege definitieterm of voeg tekst toe.');
  });

  it('points the violation at the list rather than at the term', () => {
    expect(validate('<dl><dt></dt><dd></dd></dl>')[0]?.element.tagName).toBe('DL');
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

  it('reports one violation for a list however many of its terms are empty', () => {
    expect(validate('<dl><dt></dt><dd></dd><dt>term</dt><dd>twee</dd><dt> </dt><dd> </dd></dl>')).toHaveLength(1);
  });

  it('reports a nested list separately from the list holding it', () => {
    expect(validate('<dl><dt></dt><dd><dl><dt></dt><dd></dd></dl></dd></dl>')).toHaveLength(2);
  });

  it('ignores descriptions', () => {
    expect(validate('<dl><dt>term</dt><dd></dd></dl>')).toHaveLength(0);
  });

  it('removes every empty term without a description when corrected', () => {
    const [violation] = validate('<dl><dt></dt><dd></dd><dt> </dt><dd> </dd></dl>');
    violation?.correct?.();

    expect(fragment.querySelector('dt')).toBeNull();
    expect(validator.validate([fragment])).toHaveLength(0);
  });
});
