import type { ValidationResult, Validator } from './types.ts';
import { paragraphValidators } from './nlds-components/paragraph';

const validators: readonly Validator[] = [...paragraphValidators];

const run = (validator: Validator, element: HTMLElement): ValidationResult | null => {
  const { conditions = [], correct, rules, scope, selector, severity, validatorKey } = validator;

  if (!element.matches(selector)) return null;
  if (!conditions.every((isApplicable) => isApplicable(element))) return null;
  if (rules.every((isValid) => isValid(element))) return null;

  return { correct: correct?.(element), element, scope, severity, validatorKey };
};

export const validate = (root: ParentNode): ValidationResult[] =>
  [...root.querySelectorAll('*')].flatMap((element) => {
    if (!(element instanceof HTMLElement)) return [];
    return validators.map((validator) => run(validator, element)).filter((result) => result !== null);
  });
