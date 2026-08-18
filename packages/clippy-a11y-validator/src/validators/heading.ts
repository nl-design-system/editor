import type { ContentValidator, HeadingLevel, TreeValidator, ValidationResult } from '@/types';
import { headingValidations, validationSeverity } from '@/constants';
import {
  correctDuplicateHeadingOne,
  correctEmptyHeading,
  correctHeadingLevel,
  correctHeadingWithFormatting,
  correctMissingTopLevelHeading,
} from '@/correctors';
import { isEmptyOrWhitespace } from '@/helpers';

// ── Element validators ────────────────────────────────────────────────────────

const headingMustNotBeEmpty: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  return {
    correct: correctEmptyHeading(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

const headingShouldNotContainBoldOrItalic: ContentValidator = (_dom, node) => {
  if (!/^H[1-6]$/.test(node.tagName)) return null;
  if (!node.querySelector('strong, b, em, i')) return null;
  return {
    correct: correctHeadingWithFormatting(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
  };
};

// ── Tree validators (heading order across the whole content) ──────────────────

export const headingMustHaveCorrectOrder: TreeValidator = (dom, settings) => {
  const errors: ValidationResult[] = [];
  const { topHeadingLevel = 1 } = settings ?? {};
  let precedingHeadingLevel = topHeadingLevel;

  dom.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const headingLevel = Number.parseInt(heading.tagName.slice(1), 10) as HeadingLevel;

    if (headingLevel < topHeadingLevel) {
      const targetLevel = topHeadingLevel as HeadingLevel;
      errors.push({
        correct: correctHeadingLevel(heading, targetLevel),
        element: heading,
        scope: 'block',
        severity: validationSeverity.ERROR,
        solutionPayload: { headingLevel, precedingHeadingLevel, targetLevel, topHeadingLevel },
      });
    }

    if (headingLevel > precedingHeadingLevel + 1) {
      const targetLevel = (precedingHeadingLevel + 1) as HeadingLevel;
      errors.push({
        correct: correctHeadingLevel(heading, targetLevel),
        element: heading,
        scope: 'block',
        severity: validationSeverity.WARNING,
        solutionPayload: { headingLevel, precedingHeadingLevel, targetLevel, topHeadingLevel },
      });
    }

    precedingHeadingLevel = headingLevel;
  });

  return errors;
};

export const headingOneMustBeUnique: TreeValidator = (dom) => {
  const h1s = Array.from(dom.querySelectorAll<HTMLHeadingElement>('h1'));
  if (h1s.length <= 1) return [];

  return h1s.slice(1).map((h1) => ({
    correct: correctDuplicateHeadingOne(h1),
    element: h1,
    scope: 'block' as const,
    severity: validationSeverity.ERROR,
  }));
};

export const headingOneMustBeFirst: TreeValidator = (dom, settings) => {
  const topHeadingLevel = settings?.topHeadingLevel ?? 1;
  if (topHeadingLevel !== 1) return [];

  const firstChild = dom.firstElementChild;
  if (firstChild?.tagName === 'H1') return [];

  const target = firstChild ?? dom;
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
