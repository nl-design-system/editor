import type { ContentValidator } from '@/types';
import { richTextContentValidations, validationSeverity } from '@/constants';
import { correctEmptyMark, correctEmptyNode, correctUnderlinedMark } from './corrector';
import { emptyBlockNodeType, emptyInlineType, isUnderlined } from './rules';

const nodeShouldNotBeEmpty: ContentValidator = (_dom, node, { t }) => {
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

const inlineShouldNotBeEmpty: ContentValidator = (_dom, node, { t }) => {
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

const inlineShouldNotBeUnderlined: ContentValidator = (_dom, node, { t }) => {
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

export const richTextContentValidators: Record<string, ContentValidator> = {
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_EMPTY]: inlineShouldNotBeEmpty,
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: inlineShouldNotBeUnderlined,
  [richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty,
};
