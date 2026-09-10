import { beforeEach } from 'vitest';
import type { Validation, Violation } from '../types/validation.ts';
import { Validator } from '../validator.ts';

export type RuleTest = {
  fragment: HTMLElement;
  validate: (html: string) => Violation[];
  validator: Validator;
};

/**
 * The fixture every rule test needs. Call once per file, at module scope; the fragment is reused across tests, so
 * it stays safe to destructure.
 */
export const initializeRuleTest = (validations: readonly Validation[]): RuleTest => {
  const fragment = document.createElement('div');
  const validator = new Validator({ validations });

  const validate = (html: string): Violation[] => {
    fragment.innerHTML = html;
    return validator.validate([fragment]);
  };

  beforeEach(() => {
    fragment.replaceChildren();
    document.body.replaceChildren(fragment);
  });

  return { fragment, validate, validator };
};
