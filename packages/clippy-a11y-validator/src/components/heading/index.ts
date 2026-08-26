import type { ContentValidator, TreeValidator } from '@/types';
import { headingValidations, validationSeverity } from '@/constants';
import { validationContext } from '@/i18n';
import {
  correctDuplicateHeadingOne,
  correctEmptyHeading,
  correctHeadingLevel,
  correctHeadingWithFormatting,
  correctMissingTopLevelHeading,
} from './corrector';
import {
  allowedHeadingLevels,
  findHeadingOrderOffenses,
  findMisplacedTopLevelHeading,
  findRepeatedHeadingOnes,
  hasFormattingInsideHeading,
  isEmptyHeading,
} from './rules';

// ── Element validators ────────────────────────────────────────────────────────

const headingMustNotBeEmpty: ContentValidator = (_dom, node) => {
  if (!isEmptyHeading(node)) return null;
  return {
    correct: correctEmptyHeading(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

const headingShouldNotContainBoldOrItalic: ContentValidator = (_dom, node, { t }) => {
  if (!hasFormattingInsideHeading(node)) return null;
  return {
    correct: correctHeadingWithFormatting(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
    solution: t(`${headingValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC}.solution`),
  };
};

// ── Tree validators (heading order across the whole content) ──────────────────

/** A heading above the allowed top level is an error; a skipped level only a warning. */
const ORDER_SEVERITY = {
  'above-top-level': validationSeverity.ERROR,
  'skipped-level': validationSeverity.WARNING,
} as const;

export const headingMustHaveCorrectOrder: TreeValidator = (dom, context = validationContext()) => {
  const { t, topHeadingLevel = 1 } = context;

  return findHeadingOrderOffenses(dom, topHeadingLevel).map(
    ({ heading, headingLevel, precedingHeadingLevel, problem, targetLevel }) => ({
      correct: correctHeadingLevel(heading, targetLevel),
      element: heading,
      scope: 'block' as const,
      severity: ORDER_SEVERITY[problem],
      solution: t(`${headingValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER}.solution`, {
        aboveTopLevel: problem === 'above-top-level',
        allowedLevels: problem === 'above-top-level' ? [] : allowedHeadingLevels(topHeadingLevel, targetLevel),
        headingLevel,
        precedingHeadingLevel,
      }),
    }),
  );
};

export const headingOneMustBeUnique: TreeValidator = (dom) =>
  findRepeatedHeadingOnes(dom).map((h1) => ({
    correct: correctDuplicateHeadingOne(h1),
    element: h1,
    scope: 'block' as const,
    severity: validationSeverity.ERROR,
  }));

export const headingOneMustBeFirst: TreeValidator = (dom, context) => {
  const target = findMisplacedTopLevelHeading(dom, context?.topHeadingLevel ?? 1);
  if (!target) return [];

  return [
    {
      correct: correctMissingTopLevelHeading(target),
      element: target,
      scope: 'block',
      severity: validationSeverity.INFO,
    },
  ];
};

// ── Validator maps ────────────────────────────────────────────────────────────

export const headingContentValidators: Record<string, ContentValidator> = {
  [headingValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [headingValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic,
};

export const headingTreeValidators: Record<string, TreeValidator> = {
  [headingValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: headingMustHaveCorrectOrder,
  [headingValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: headingOneMustBeUnique,
  [headingValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: headingOneMustBeFirst,
};
