import type { Level } from '@tiptap/extension-heading';
import type { EditorSettings } from '@/types/settings.ts';
import type { DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidations, validationSeverity } from '@/constants';
import { correctDuplicateHeadingOne, correctHeadingLevel, correctMissingTopLevelHeading } from '@/correctors/index.ts';
import { getElementRange } from '@/validators/helpers.ts';

// ── Document validators ───────────────────────────────────────────────────────

export const documentMustHaveCorrectHeadingOrder = (
  dom: HTMLElement,
  settings?: EditorSettings,
): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  const { topHeadingLevel = 1 } = settings ?? {};
  let precedingHeadingLevel = topHeadingLevel;

  dom.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const headingLevel = Number.parseInt(heading.tagName.slice(1), 10) as Level;

    if (headingLevel < topHeadingLevel) {
      const targetLevel = topHeadingLevel as Level;
      errors.push({
        correct: correctHeadingLevel(heading, targetLevel),
        range: getElementRange(heading),
        scope: 'block',
        severity: validationSeverity.ERROR,
        tipPayload: { headingLevel, precedingHeadingLevel, topHeadingLevel },
      });
    }

    if (headingLevel > precedingHeadingLevel + 1) {
      const targetLevel = (precedingHeadingLevel + 1) as Level;
      errors.push({
        correct: correctHeadingLevel(heading, targetLevel),
        range: getElementRange(heading),
        scope: 'block',
        severity: validationSeverity.WARNING,
        tipPayload: { headingLevel, precedingHeadingLevel, topHeadingLevel },
      });
    }

    precedingHeadingLevel = headingLevel;
  });

  return errors;
};

export const documentMustHaveSingleHeadingOne = (dom: HTMLElement): ValidationResult[] => {
  const h1s = Array.from(dom.querySelectorAll<HTMLHeadingElement>('h1'));
  if (h1s.length <= 1) return [];

  return h1s.slice(1).map((h1) => ({
    correct: correctDuplicateHeadingOne(h1),
    range: getElementRange(h1),
    scope: 'block' as const,
    severity: validationSeverity.ERROR,
  }));
};

export const documentMustHaveTopLevelHeadingOne = (dom: HTMLElement, settings?: EditorSettings): ValidationResult[] => {
  const topHeadingLevel = settings?.topHeadingLevel ?? 1;
  if (topHeadingLevel !== 1) return [];

  const firstChild = dom.firstElementChild;
  if (firstChild?.tagName === 'H1') return [];

  const target = firstChild ?? dom;
  return [
    {
      correct: target instanceof Element ? correctMissingTopLevelHeading(target) : undefined,
      range: getElementRange(target),
      scope: 'block',
      severity: validationSeverity.INFO,
    },
  ];
};

// ── Validator map ─────────────────────────────────────────────────────────────

type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];

export const documentValidatorObject: { [K in DocumentValidationKey]: DocumentValidator } = {
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: documentMustHaveCorrectHeadingOrder,
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: documentMustHaveSingleHeadingOne,
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: documentMustHaveTopLevelHeadingOne,
};
