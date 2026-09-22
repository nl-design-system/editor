import { describe, expect, it } from 'vitest';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { paragraphShouldNotBeEmpty } from './index.ts';

const { validate } = initializeRuleTest([paragraphShouldNotBeEmpty]);

describe('paragraphShouldNotBeEmpty', () => {
  it('flags an empty paragraph', () => {
    const [violation] = validate('<p></p>');

    expect(violation?.rule).toBe('PARAGRAPH_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe('Deze alinea is leeg.');
    expect(violation?.messages.solution).toBe('Verwijder de lege alinea of voeg tekst toe.');
  });

  it('flags a paragraph that contains only whitespace', () => {
    expect(validate('<p>   </p>')).toHaveLength(1);
  });

  it('flags a paragraph that contains only a line break', () => {
    expect(validate('<p><br></p>')).toHaveLength(1);
  });

  it('accepts a paragraph with text', () => {
    expect(validate('<p>tekst</p>')).toHaveLength(0);
  });

  it('accepts a paragraph whose text is nested in an inline element', () => {
    expect(validate('<p><strong>tekst</strong></p>')).toHaveLength(0);
  });

  it('ignores elements that are not paragraphs', () => {
    expect(validate('<div></div>')).toHaveLength(0);
  });

  it('offers no correction', () => {
    expect(validate('<p></p>')[0]?.correct).toBeUndefined();
  });
});
