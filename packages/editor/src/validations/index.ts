import {
  coreValidations,
  Validator,
  type Validation,
  type Violation as CoreViolation,
} from '@nl-design-system-community/clippy-a11y-validator';
import type { EditorSettings } from '@/types/settings';
import type { Violation, ViolationsMap } from '@/types/validation';
import { getDocumentLang } from '@/localization';
import { debounce } from '@/utils/debounce';
import { getElementRange } from '@/utils/ranges';
import { editorCorrections } from './corrections';

const VALIDATION_TIMEOUT = 500;

/**
 * Normalise a rule identifier to the canonical SCREAMING_SNAKE_CASE format used by the validator
 * package (e.g. `'PARAGRAPH_SHOULD_NOT_BE_EMPTY'`).
 *
 * Accepts both kebab-case (`'paragraph-should-not-be-empty'`) as used in HTML `enable-rules` /
 * `disable-rules` attributes, and SCREAMING_SNAKE_CASE as used in TypeScript constants.
 */
const toUpperKey = (key: string): string => key.toUpperCase().replaceAll('-', '_');

/**
 * The validations active under the given settings.
 *
 * - `disableRules: ['*']` — disables everything.
 * - `enableRules: ['*']` — enables everything, minus anything explicitly disabled.
 * - Otherwise only rules explicitly listed in `enableRules` are active.
 */
export const activeValidations = ({ disableRules = [], enableRules }: EditorSettings): Validation[] => {
  const disabled = new Set(disableRules.map(toUpperKey));
  if (disabled.has('*')) return [];

  const entries = Object.entries(coreValidations);

  const enabled = new Set(enableRules.map(toUpperKey));
  const isEnabled = enabled.has('*') ? () => true : (rule: string) => enabled.has(rule);

  return entries.filter(([rule]) => isEnabled(rule) && !disabled.has(rule)).map(([, validation]) => validation);
};

/**
 * Adds what the editor needs on top of a reported violation: the DOM `Range` the gutter, the
 * highlights and the content views position themselves on, and the correction for the rules the
 * validator package leaves to the editor.
 */
const toEditorViolation = (violation: CoreViolation): Violation => {
  const range = getElementRange(violation.element);
  const override = editorCorrections[violation.rule as keyof typeof editorCorrections];

  if (!override) return { ...violation, ...(range === undefined ? {} : { range }) };

  return {
    ...violation,
    correct: override.correct(violation.element, range),
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
  settings: EditorSettings,
  callback: (violations: ViolationsMap) => void,
): void => {
  const violations: ViolationsMap = new Map();

  try {
    const validator = new Validator({
      locale: getDocumentLang(),
      topHeadingLevel: settings.topHeadingLevel,
      validations: activeValidations(settings),
    });

    for (const reported of validator.validate(dom)) {
      const violation = toEditorViolation(reported);
      if (violation.range) violations.set(violation.range, violation);
    }
  } catch (err) {
    console.error('Validation error:', err);
  }

  callback(violations);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
