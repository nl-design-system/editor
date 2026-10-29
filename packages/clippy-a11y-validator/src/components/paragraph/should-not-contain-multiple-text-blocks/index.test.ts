import { describe, expect, it } from 'vitest';
import { getDocumentationComponentRuleById } from '../../../documentation.ts';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { paragraphShouldNotContainMultipleTextBlocks } from './index.ts';

const { fragment, validate } = initializeRuleTest([paragraphShouldNotContainMultipleTextBlocks]);

describe('paragraphShouldNotContainMultipleTextBlocks', () => {
  it('flags text blocks separated by a blank line', () => {
    const [violation] = validate('<p>Eerste blok.<br><br>Tweede blok.</p>');

    expect(violation).toEqual({
      element: fragment.querySelector('p'),
      messages: getDocumentationComponentRuleById(paragraphShouldNotContainMultipleTextBlocks.documentationId),
      rule: 'PARAGRAPH_SHOULD_NOT_CONTAIN_MULTIPLE_TEXT_BLOCKS',
      scope: 'element',
      severity: 'warning',
    });
  });

  it('flags a blank line that contains only whitespace', () => {
    expect(validate('<p>Eerste blok.<br> <br>Tweede blok.</p>')).toHaveLength(1);
  });

  it('accepts a single line break', () => {
    expect(validate('<p>Eerste regel.<br>Tweede regel.</p>')).toHaveLength(0);
  });

  it('accepts blank lines at the start or end of the paragraph', () => {
    expect(validate('<p><br><br>Tekst.<br><br></p>')).toHaveLength(0);
  });

  it('accepts line breaks inside an inline element', () => {
    expect(validate('<p><em>Eerste blok.<br><br>Tweede blok.</em></p>')).toHaveLength(0);
  });

  it('ignores elements that are not paragraphs', () => {
    expect(validate('<div>Eerste blok.<br><br>Tweede blok.</div>')).toHaveLength(0);
  });

  it('offers no correction', () => {
    expect(validate('<p>Eerste blok.<br><br>Tweede blok.</p>')[0]).not.toHaveProperty('correction');
  });
});
