import { beforeEach, describe, expect, it } from 'vitest';
import type { Validation } from './types/validation.ts';
import { coreValidationRules, coreValidations } from './components/index.ts';
import { Validator } from './validator.ts';

const {
  HEADING_MUST_NOT_BE_EMPTY,
  PARAGRAPH_SHOULD_NOT_BE_EMPTY,
  PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
  TABLE_MUST_HAVE_HEADINGS,
  TABLE_MUST_HAVE_MULTIPLE_ROWS,
} = coreValidationRules;

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
      PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('reports violations in document order', () => {
    const validator = new Validator({
      validations: [coreValidations[HEADING_MUST_NOT_BE_EMPTY], coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]],
    });
    root.innerHTML = '<p></p><h1></h1><p></p>';

    expect(validator.validate(root).map(({ element }) => element.tagName)).toEqual(['P', 'H1', 'P']);
  });

  it('reports several violations on the same element in registration order', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });
    root.innerHTML = '<table><tbody><tr><td>Paspoort</td></tr></tbody></table>';

    expect(validator.validate(root).map(({ rule }) => rule)).toEqual([
      TABLE_MUST_HAVE_HEADINGS,
      TABLE_MUST_HAVE_MULTIPLE_ROWS,
    ]);
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
      PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('falls back to the default locale when the requested locale has no messages', () => {
    const validator = new Validator({ locale: 'en', validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });

    expect(validator.validate(root)[0]?.messages.error).toBe('Deze alinea is leeg.');
  });

  it('hands the validated root to the condition', () => {
    const seen: ParentNode[] = [];
    const spy: Validation = {
      condition: (_element, validatedRoot) => {
        seen.push(validatedRoot);
        return true;
      },
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'block',
      selector: 'p',
      severity: 'info',
    };

    new Validator({ validations: [spy] }).validate(root);

    expect(seen).toEqual([root, root]);
  });

  it('hands the validated root to payload and correct', () => {
    const seen: ParentNode[] = [];
    const spy: Validation = {
      condition: () => false,
      correct: (_element, validatedRoot) => {
        seen.push(validatedRoot);
        return () => {};
      },
      messages: { nl: { error: 'x' } },
      payload: (_element, validatedRoot) => {
        seen.push(validatedRoot);
        return {};
      },
      rule: 'SPY',
      scope: 'block',
      selector: 'p:first-child',
      severity: 'info',
    };

    new Validator({ validations: [spy] }).validate(root);

    expect(seen).toEqual([root, root]);
  });
});
