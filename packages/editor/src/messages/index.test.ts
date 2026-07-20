import { describe, expect, it } from 'vitest';
import { blockValidations, documentValidations, inlineValidations } from '@/constants';
import { nodeTypesTranslations, validationMessages } from './index';

const messages = validationMessages();

describe('validationMessages', () => {
  it('provides a description for every rule key', () => {
    for (const key of [
      ...Object.values(blockValidations),
      ...Object.values(inlineValidations),
      ...Object.values(documentValidations),
    ]) {
      expect(messages[key].description.length).toBeGreaterThan(0);
    }
  });

  it('nodeTypesTranslations covers the known node types', () => {
    const translations = nodeTypesTranslations();
    expect(translations['paragraph']).toBeTruthy();
    expect(translations['tableCell']).toBeTruthy();
    expect(translations['link']).toBeTruthy();
  });
});

describe('tip functions', () => {
  it('NODE_SHOULD_NOT_BE_EMPTY renders a tip for a known node type and null otherwise', () => {
    const { tip } = messages[blockValidations.NODE_SHOULD_NOT_BE_EMPTY];
    expect(tip?.({ nodeType: 'paragraph' })).not.toBeNull();
    expect(tip?.()).toBeNull();
    expect(tip?.({ nodeType: 42 })).toBeNull();
  });

  it('PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST renders a tip only with a prefix', () => {
    const { tip } = messages[blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST];
    expect(tip?.({ prefix: '-' })).not.toBeNull();
    expect(tip?.()).toBeNull();
  });

  it('INLINE_SHOULD_NOT_BE_EMPTY renders a tip only with a node type', () => {
    const { tip } = messages[inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY];
    expect(tip?.({ nodeType: 'bold' })).not.toBeNull();
    expect(tip?.({})).toBeNull();
  });

  it('HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC and INLINE_SHOULD_NOT_BE_UNDERLINED have static tips', () => {
    expect(messages[blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC].tip?.()).not.toBeNull();
    expect(messages[inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED].tip?.()).not.toBeNull();
  });

  describe('DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER', () => {
    const { tip } = messages[documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER];

    it('explains a heading that exceeds the highest allowed level', () => {
      expect(tip?.({ headingLevel: 1, precedingHeadingLevel: 2, topHeadingLevel: 2 })).not.toBeNull();
    });

    it('returns null when required numbers are missing', () => {
      expect(tip?.({ headingLevel: 3 })).toBeNull();
    });

    it('renders a single allowed level', () => {
      // preceding 1, top 1 → min 2, max 2 → one level
      expect(tip?.({ headingLevel: 3, precedingHeadingLevel: 1, topHeadingLevel: 1 })).not.toBeNull();
    });

    it('renders two allowed levels', () => {
      // preceding 2, top 1 → min 2, max 3 → two levels
      expect(tip?.({ headingLevel: 5, precedingHeadingLevel: 2, topHeadingLevel: 1 })).not.toBeNull();
    });

    it('renders three or more allowed levels', () => {
      // preceding 3, top 1 → min 2, max 4 → three levels
      expect(tip?.({ headingLevel: 6, precedingHeadingLevel: 3, topHeadingLevel: 1 })).not.toBeNull();
    });
  });
});
