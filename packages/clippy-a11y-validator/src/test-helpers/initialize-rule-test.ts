import { beforeEach } from 'vitest';
import type { Validation, Violation } from '../types/validation.ts';
import { Validator } from '../validator.ts';

export type RuleTest = {
  root: HTMLElement;
  validate: (html: string) => Violation[];
  validator: Validator;
};

/**
 * Sets up the fixture every rule test needs: a root attached to the document, a validator holding just the rules
 * under test, and a `validate` that renders html into the root and returns the violations it finds there.
 *
 * The root is created once and reused rather than recreated per test, so it stays safe to destructure. Every test
 * still starts with an empty root that is the body's only child. Call this once per file, at module scope.
 */
export const initializeRuleTest = (validations: readonly Validation[]): RuleTest => {
  const root = document.createElement('div');
  const validator = new Validator({ validations });

  const validate = (html: string): Violation[] => {
    root.innerHTML = html;
    return validator.validate(root);
  };

  beforeEach(() => {
    root.replaceChildren();
    document.body.replaceChildren(root);
  });

  return { root, validate, validator };
};
