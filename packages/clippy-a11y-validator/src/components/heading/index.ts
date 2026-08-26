import type { ContentValidator, TreeValidator, ValidationContext } from '@/types';
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

const headingShouldNotContainBoldOrItalic =
  ({ t }: ValidationContext): ContentValidator =>
  (_dom, node) => {
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

export const headingMustHaveCorrectOrder =
  ({ t, topHeadingLevel = 1 }: ValidationContext = validationContext()): TreeValidator =>
  (dom) =>
    findHeadingOrderOffenses(dom, topHeadingLevel).map(
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

export const headingOneMustBeUnique = (): TreeValidator => (dom) =>
  findRepeatedHeadingOnes(dom).map((h1) => ({
    correct: correctDuplicateHeadingOne(h1),
    element: h1,
    scope: 'block' as const,
    severity: validationSeverity.ERROR,
  }));

export const headingOneMustBeFirst =
  ({ topHeadingLevel = 1 }: ValidationContext = validationContext()): TreeValidator =>
  (dom) => {
    const target = findMisplacedTopLevelHeading(dom, topHeadingLevel);
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

/**
 * Build the heading validators for one run. Rules that word their own `solution`
 * close over the context's translator here, so detection itself only ever takes
 * the DOM it inspects.
 */
export const headingContentValidators = (context: ValidationContext): Record<string, ContentValidator> => ({
  [headingValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [headingValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic(context),
});

export const headingTreeValidators = (context: ValidationContext): Record<string, TreeValidator> => ({
  [headingValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: headingMustHaveCorrectOrder(context),
  [headingValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: headingOneMustBeUnique(),
  [headingValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: headingOneMustBeFirst(context),
});
