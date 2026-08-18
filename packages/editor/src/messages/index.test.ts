import { describe, expect, it } from 'vitest';
import { validations } from '@/constants';
import { nodeTypesTranslations, validationMessages, type ValidationMessages } from './index';

const messages = validationMessages();

type SolutionValue = ValidationMessages[keyof ValidationMessages]['solution'];

/** Invokes a dynamic solution, mirroring how `renderSolution` narrows the string | function union. */
const callSolution = (solution: SolutionValue, params?: Record<string, number | string | boolean>) =>
  typeof solution === 'function' ? solution(params) : null;

describe('validationMessages', () => {
  it('provides a description for every rule key', () => {
    for (const key of Object.values(validations)) {
      expect(messages[key].heading.length).toBeGreaterThan(0);
    }
  });

  it('nodeTypesTranslations covers the known node types', () => {
    const translations = nodeTypesTranslations();
    expect(translations['paragraph']).toBeTruthy();
    expect(translations['tableCell']).toBeTruthy();
    expect(translations['link']).toBeTruthy();
  });
});

describe('solution functions', () => {
  it('NODE_SHOULD_NOT_BE_EMPTY renders a solution for a known node type and null otherwise', () => {
    const { solution } = messages[validations.NODE_SHOULD_NOT_BE_EMPTY];
    expect(callSolution(solution, { nodeType: 'paragraph' })).not.toBeNull();
    expect(callSolution(solution)).toBeNull();
    expect(callSolution(solution, { nodeType: 42 })).toBeNull();
  });

  it('PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST renders a solution only with a prefix', () => {
    const { solution } = messages[validations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST];
    expect(callSolution(solution, { prefix: '-' })).not.toBeNull();
    expect(callSolution(solution)).toBeNull();
  });

  it('INLINE_SHOULD_NOT_BE_EMPTY renders a solution only with a node type', () => {
    const { solution } = messages[validations.INLINE_SHOULD_NOT_BE_EMPTY];
    expect(callSolution(solution, { nodeType: 'bold' })).not.toBeNull();
    expect(callSolution(solution, {})).toBeNull();
  });

  it('HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC and INLINE_SHOULD_NOT_BE_UNDERLINED have static tips', () => {
    expect(callSolution(messages[validations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC].solution)).not.toBeNull();
    expect(callSolution(messages[validations.INLINE_SHOULD_NOT_BE_UNDERLINED].solution)).not.toBeNull();
  });

  describe('DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER', () => {
    const { solution } = messages[validations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER];

    it('explains a heading that exceeds the highest allowed level', () => {
      expect(callSolution(solution, { headingLevel: 1, precedingHeadingLevel: 2, topHeadingLevel: 2 })).not.toBeNull();
    });

    it('returns null when required numbers are missing', () => {
      expect(callSolution(solution, { headingLevel: 3 })).toBeNull();
    });

    it('renders a single allowed level', () => {
      // preceding 1, top 1 → min 2, max 2 → one level
      expect(callSolution(solution, { headingLevel: 3, precedingHeadingLevel: 1, topHeadingLevel: 1 })).not.toBeNull();
    });

    it('renders two allowed levels', () => {
      // preceding 2, top 1 → min 2, max 3 → two levels
      expect(callSolution(solution, { headingLevel: 5, precedingHeadingLevel: 2, topHeadingLevel: 1 })).not.toBeNull();
    });

    it('renders three or more allowed levels', () => {
      // preceding 3, top 1 → min 2, max 4 → three levels
      expect(callSolution(solution, { headingLevel: 6, precedingHeadingLevel: 3, topHeadingLevel: 1 })).not.toBeNull();
    });
  });
});
