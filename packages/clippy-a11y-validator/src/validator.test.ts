import { beforeEach, describe, expect, it } from 'vitest';
import type { Validation } from './types/validation.ts';
import { defineValidation } from './define-validation.ts';
import { Validator } from './validator.ts';

const alwaysFails = (rule: string, severity: Validation['severity'], selector = 'p'): Validation =>
  defineValidation({
    condition: () => false,
    messages: { nl: { error: `${rule} fout.` } },
    rule,
    scope: 'block',
    selector,
    severity,
  });

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement('div');
  root.innerHTML = '<p>first</p><section><p>second</p></section>';
  document.body.replaceChildren(root);
});

describe('Validator', () => {
  it('reports violations in document order', () => {
    const violations = new Validator({ validations: [alwaysFails('A', 'warning')] }).validate(root);
    expect(violations.map(({ element }) => element.textContent)).toEqual(['first', 'second']);
  });

  it('replaces a validation registered under an existing rule', () => {
    const validator = new Validator({ validations: [alwaysFails('A', 'warning')] });
    validator.register(alwaysFails('A', 'error'));

    expect(validator.validate(root).map(({ severity }) => severity)).toEqual(['error', 'error']);
  });

  it('stops reporting a validation after it is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(alwaysFails('A', 'warning'));

    expect(validator.validate(root)).toHaveLength(2);
    unregister();
    expect(validator.validate(root)).toHaveLength(0);
  });

  it('leaves a replacement in place when the replaced validation is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(alwaysFails('A', 'warning'));
    validator.register(alwaysFails('A', 'error'));
    unregister();

    expect(validator.validate(root)).toHaveLength(2);
  });

  it('skips validations outside the requested severities', () => {
    const validator = new Validator({
      validations: [alwaysFails('A', 'warning'), alwaysFails('B', 'error')],
    });

    expect(validator.validate(root, { severities: ['error'] }).map(({ rule }) => rule)).toEqual(['B', 'B']);
  });

  it('resolves messages in the configured locale', () => {
    const validation = defineValidation({
      condition: () => false,
      messages: { en: { error: 'English.' }, nl: { error: 'Nederlands.' } },
      rule: 'A',
      scope: 'block',
      selector: 'p',
      severity: 'warning',
    });

    expect(new Validator({ locale: 'en', validations: [validation] }).validate(root)[0]?.messages.error).toBe(
      'English.',
    );
  });

  it('exposes the payload and interpolates it into the message', () => {
    const validation = defineValidation({
      condition: () => false,
      messages: { nl: { error: 'De {nodeType} is fout.' } },
      payload: () => ({ nodeType: 'alinea' }),
      rule: 'A',
      scope: 'block',
      selector: 'p',
      severity: 'warning',
    });

    const violation = new Validator({ validations: [validation] }).validate(root)[0];
    expect(violation?.messages.error).toBe('De alinea is fout.');
    expect(violation?.payload).toEqual({ nodeType: 'alinea' });
  });

  it('does not report an element that satisfies its rule', () => {
    const validation = defineValidation({
      condition: () => true,
      messages: { nl: { error: 'Fout.' } },
      rule: 'A',
      scope: 'block',
      selector: 'p',
      severity: 'warning',
    });

    expect(new Validator({ validations: [validation] }).validate(root)).toHaveLength(0);
  });
});
