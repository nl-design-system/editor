import type { ContentValidator, ValidationContext } from '@/types';
import { richTextContentValidations, validationSeverity } from '@/constants';
import { correctEmptyMark, correctEmptyNode, correctUnderlinedMark } from './corrector';
import { emptyBlockNodeType, emptyInlineType, isUnderlined } from './rules';

const nodeShouldNotBeEmpty =
  ({ t }: ValidationContext): ContentValidator =>
  (_dom, node) => {
    const nodeType = emptyBlockNodeType(node);
    if (!nodeType) return null;
    return {
      correct: correctEmptyNode(node, nodeType),
      element: node,
      scope: 'block',
      severity: validationSeverity.INFO,
      solution: t(`${richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY}.solution`, {
        nodeType: t(`nodeTypes.${nodeType}`) ?? nodeType,
      }),
    };
  };

const inlineShouldNotBeEmpty =
  ({ t }: ValidationContext): ContentValidator =>
  (_dom, node) => {
    const inlineType = emptyInlineType(node);
    if (!inlineType) return null;
    return {
      correct: correctEmptyMark(node),
      element: node,
      scope: 'inline',
      severity: validationSeverity.WARNING,
      solution: t(`${richTextContentValidations.INLINE_SHOULD_NOT_BE_EMPTY}.solution`, {
        nodeType: t(`nodeTypes.${inlineType}`) ?? inlineType,
      }),
    };
  };

const inlineShouldNotBeUnderlined =
  ({ t }: ValidationContext): ContentValidator =>
  (_dom, node) => {
    if (!isUnderlined(node)) return null;
    return {
      correct: correctUnderlinedMark(node),
      element: node,
      scope: 'inline',
      severity: validationSeverity.INFO,
      solution: t(`${richTextContentValidations.INLINE_SHOULD_NOT_BE_UNDERLINED}.solution`),
    };
  };

// ── Validator map ─────────────────────────────────────────────────────────────

/**
 * Build the rich-text-content validators for one run. Each words its own
 * `solution`, so all three close over the context's translator here.
 */
export const richTextContentValidators = (context: ValidationContext): Record<string, ContentValidator> => ({
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_EMPTY]: inlineShouldNotBeEmpty(context),
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: inlineShouldNotBeUnderlined(context),
  [richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty(context),
});
