import { describe, expect, it } from 'vitest';
import { getPrimaryCorrection } from '../../../corrections.ts';
import { getDocumentationComponentRuleById } from '../../../documentation.ts';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { Validator } from '../../../validator.ts';
import { paragraphShouldNotBeEntirelyBold } from '../../paragraph/should-not-be-entirely-bold/index.ts';
import { headingShouldNotBeTooLong } from './index.ts';

const { fragment, validate, validator } = initializeRuleTest([headingShouldNotBeTooLong]);

describe('headingShouldNotBeTooLong', () => {
  it('flags a heading longer than 60 characters', () => {
    const [violation] = validate(`<h2>${'a'.repeat(61)}</h2>`);

    expect(violation).toEqual({
      corrections: [
        {
          execute: expect.any(Function),
          label: 'Omzetten naar alinea',
          solutionId: '6581c26a-13b9-482d-a433-147f29110227',
        },
      ],
      element: fragment.querySelector('h2'),
      messages: {
        ...getDocumentationComponentRuleById(headingShouldNotBeTooLong.documentationId),
        href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/',
      },
      rule: 'HEADING_SHOULD_NOT_BE_TOO_LONG',
      scope: 'element',
      severity: 'info',
    });
  });

  it('accepts a heading of exactly 60 characters', () => {
    expect(validate(`<h2>${'a'.repeat(60)}</h2>`)).toHaveLength(0);
  });

  it('measures the text without the surrounding whitespace', () => {
    expect(validate(`<h2>   ${'a'.repeat(60)}   </h2>`)).toHaveLength(0);
  });

  it('turns the heading into a paragraph when corrected, keeping its content', () => {
    const text = 'a'.repeat(61);
    const [violation] = validate(`<h2 lang="en">${text}</h2>`);
    getPrimaryCorrection(violation?.corrections)?.execute();

    expect(fragment.innerHTML).toBe(`<p lang="en">${text}</p>`);
    expect(validator.validate([fragment])).toHaveLength(0);
  });

  it('flags the heading a long bold paragraph is converted to', () => {
    const boldThenHeading = new Validator({
      validations: [paragraphShouldNotBeEntirelyBold, headingShouldNotBeTooLong],
    });
    fragment.innerHTML = `<p><strong>${'a'.repeat(61)}</strong></p>`;
    const [violation] = boldThenHeading.validate([fragment]);
    violation?.corrections?.find(({ label }) => label === 'Omzetten naar kop')?.execute();

    expect(boldThenHeading.validate([fragment]).map(({ rule }) => rule)).toEqual(['HEADING_SHOULD_NOT_BE_TOO_LONG']);
  });
});
