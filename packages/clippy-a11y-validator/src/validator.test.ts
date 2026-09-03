import { beforeEach, describe, expect, it } from 'vitest';
import { coreValidationRules, coreValidations } from './nlds-components/index.ts';
import { Validator } from './validator.ts';

const { PARAGRAPH_SHOULD_NOT_BE_EMPTY, PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD } = coreValidationRules;

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement('div');
  root.innerHTML = '<p><strong>Vetgedrukt</strong></p><p> </p>';
  document.body.replaceChildren(root);
});

describe('Validator', () => {
  it('only reports the cherry-picked validation', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });

    expect(validator.validate(root).map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('reports every core validation when all of them are registered', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });

    expect(validator.validate(root).map(({ rule }) => rule)).toEqual([
      PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('reports violations in document order', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });

    expect(validator.validate(root).map(({ element }) => element.textContent)).toEqual(['Vetgedrukt', ' ']);
  });

  it('replaces a validation registered under an existing rule', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });
    validator.register({ ...coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY], severity: 'error' });

    expect(validator.validate(root).map(({ severity }) => severity)).toEqual(['error']);
  });

  it('stops reporting a validation after it is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);

    expect(validator.validate(root)).toHaveLength(1);
    unregister();
    expect(validator.validate(root)).toHaveLength(0);
  });

  it('leaves a replacement in place when the replaced validation is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    validator.register({ ...coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY], severity: 'error' });
    unregister();

    expect(validator.validate(root).map(({ severity }) => severity)).toEqual(['error']);
  });

  it('skips validations outside the requested severities', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });

    expect(validator.validate(root, { severities: ['info'] }).map(({ rule }) => rule)).toEqual([
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('falls back to the default locale when the requested locale has no messages', () => {
    const validator = new Validator({ locale: 'en', validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });

    expect(validator.validate(root)[0]?.messages.error).toBe('Deze alinea is leeg.');
  });
});
