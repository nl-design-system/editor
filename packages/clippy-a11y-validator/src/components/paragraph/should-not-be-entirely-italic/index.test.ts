import { describe, expect, it } from 'vitest';
import { getDocumentationComponentRuleById } from '../../../documentation.ts';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { paragraphShouldNotBeEntirelyItalic } from './index.ts';

const TEXT = 'Deze alinea is volledig schuingedrukt.';

const { fragment, validate, validator } = initializeRuleTest([paragraphShouldNotBeEntirelyItalic]);

describe('paragraphShouldNotBeEntirelyItalic', () => {
  it('flags a paragraph that is entirely italic', () => {
    const [violation] = validate(`<p><em>${TEXT}</em></p>`);

    expect(violation).toEqual({
      correction: { execute: expect.any(Function) },
      element: fragment.querySelector('p'),
      messages: getDocumentationComponentRuleById(paragraphShouldNotBeEntirelyItalic.documentationId),
      rule: 'PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_ITALIC',
      scope: 'element',
      severity: 'warning',
    });
  });

  it('flags a paragraph in i elements', () => {
    expect(validate(`<p><i>${TEXT}</i></p>`)).toHaveLength(1);
  });

  it('flags a paragraph whose italic text is wrapped in another inline element', () => {
    expect(validate(`<p><strong><em>${TEXT}</em></strong></p>`)).toHaveLength(1);
  });

  it('accepts a paragraph with italic and plain text', () => {
    expect(validate(`<p><em>Schuin</em> en gewoon.</p>`)).toHaveLength(0);
  });

  it('accepts an empty paragraph', () => {
    expect(validate('<p><em> </em></p>')).toHaveLength(0);
  });

  it('ignores elements that are not paragraphs', () => {
    expect(validate(`<div><em>${TEXT}</em></div>`)).toHaveLength(0);
  });

  it('unwraps the italic children when corrected', () => {
    const [violation] = validate(`<p><em>${TEXT}</em> <i>${TEXT}</i></p>`);
    violation?.correction?.execute();

    expect(fragment.querySelector('p')?.innerHTML).toBe(`${TEXT} ${TEXT}`);
    expect(validator.validate([fragment])).toHaveLength(0);
  });
});
