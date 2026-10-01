import {
  coreValidations,
  type Validation,
  Validator,
  type Violation as CoreViolation,
} from '@nl-design-system-community/clippy-a11y-validator';
import type { Violation, ViolationsMap } from '@/types/validation';
import { getDocumentLang } from '@/localization';
import { debounce } from '@/utils/debounce';
import { getElementRange } from '@/utils/ranges';
import { resolveViolationDisplay } from '@/utils/validations';
import { editorCorrections } from './corrections';

const VALIDATION_TIMEOUT = 500;

/**
 * Adds what the editor needs on top of a reported violation: the DOM `Range` the gutter, the
 * highlights and the content views position themselves on, how the violation covers the document,
 * and the correction for the rules the validator package leaves to the editor.
 *
 * The display is resolved here because this is the one moment the offending element is known to be
 * laid out: the validator has just walked the live editor DOM.
 */
const toEditorViolation = (violation: CoreViolation): Violation => {
  const range = getElementRange(violation.element);
  const display = resolveViolationDisplay(violation.element);
  const override = editorCorrections[violation.rule as keyof typeof editorCorrections];

  if (!override) return { ...violation, display, ...(range === undefined ? {} : { range }) };

  return {
    ...violation,
    correct: override.correct(violation.element, range),
    display,
    ...(override.customCorrectLabel === undefined ? {} : { customCorrectLabel: override.customCorrectLabel() }),
    ...(range === undefined ? {} : { range }),
  };
};

/**
 * Validates `dom` with the validator package and hands the violations to `callback`.
 *
 * A violation without a range is dropped: every consumer addresses a violation by its range.
 */
export const runValidation = (
  dom: HTMLElement,
  validations: readonly Validation[] | undefined,
  callback: (violations: ViolationsMap) => void,
): void => {
  const violations: ViolationsMap = new Map();

  try {
    const validator = new Validator({
      locale: getDocumentLang(),
      validations: validations ?? Object.values(coreValidations),
    });

    for (const reported of validator.validate([dom])) {
      const violation = toEditorViolation(reported);
      if (violation.range) violations.set(violation.range, violation);
    }
  } catch (err) {
    console.error('Validation error:', err);
  }

  callback(violations);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
