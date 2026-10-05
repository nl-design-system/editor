import { beforeEach, describe, expect, it } from 'vitest';
import type { Validation } from './types/validation.ts';
import { coreValidationRules, coreValidations } from './components/index.ts';
import { Validator } from './validator.ts';

const {
  HEADING_MUST_NOT_BE_EMPTY,
  HEADING_MUST_START_AT_LEVEL_ONE,
  PARAGRAPH_SHOULD_NOT_BE_EMPTY,
  PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
  TABLE_MUST_HAVE_HEADINGS,
  TABLE_MUST_HAVE_MULTIPLE_ROWS,
} = coreValidationRules;

let fragment: HTMLElement;

beforeEach(() => {
  fragment = document.createElement('div');
  fragment.innerHTML = '<p><strong>Vetgedrukt</strong></p><p> </p>';
  document.body.replaceChildren(fragment);
});

describe('Validator', () => {
  it('only reports the cherry-picked validation', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });

    expect(validator.validate([fragment]).map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('reports every core validation when all of them are registered', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });

    expect(validator.validate([fragment]).map(({ rule }) => rule)).toEqual([
      PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('reports violations in document order', () => {
    const validator = new Validator({
      validations: [coreValidations[HEADING_MUST_NOT_BE_EMPTY], coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]],
    });
    fragment.innerHTML = '<p></p><h1></h1><p></p>';

    expect(validator.validate([fragment]).map(({ element }) => element.tagName)).toEqual(['P', 'H1', 'P']);
  });

  it('reports several violations on the same element in registration order', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });
    fragment.innerHTML = '<table><tbody><tr><td>Paspoort</td></tr></tbody></table>';

    expect(validator.validate([fragment]).map(({ rule }) => rule)).toEqual([
      TABLE_MUST_HAVE_HEADINGS,
      TABLE_MUST_HAVE_MULTIPLE_ROWS,
    ]);
  });

  it('replaces a validation registered under an existing rule', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });
    validator.register({ ...coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY], severity: 'error' });

    expect(validator.validate([fragment]).map(({ severity }) => severity)).toEqual(['error']);
  });

  it('stops reporting a validation after it is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);

    expect(validator.validate([fragment])).toHaveLength(1);
    unregister();
    expect(validator.validate([fragment])).toHaveLength(0);
  });

  it('leaves a replacement in place when the replaced validation is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    validator.register({ ...coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY], severity: 'error' });
    unregister();

    expect(validator.validate([fragment]).map(({ severity }) => severity)).toEqual(['error']);
  });

  it('skips validations outside the requested severities', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });

    expect(validator.validate([fragment], { severities: ['info'] }).map(({ rule }) => rule)).toEqual([
      PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('falls back to the default locale when the requested locale has no messages', () => {
    const validator = new Validator({ locale: 'en', validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });

    expect(validator.validate([fragment])[0]?.messages.error).toBe('Deze alinea is leeg.');
  });

  it('hands an element validation nothing but its element', () => {
    const received: unknown[][] = [];
    const spy: Validation = {
      condition: (...args: unknown[]) => {
        received.push(args);
        return true;
      },
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'element',
      selector: 'h1',
      severity: 'info',
    };
    fragment.innerHTML = '<h1>Een</h1>';

    new Validator({ validations: [spy] }).validate([fragment]);

    expect(received).toEqual([[fragment.querySelector('h1')]]);
  });

  it('lets a document validation read the nearest earlier match across fragments, in the order they are given', () => {
    const nearestPrecedingTexts: (string | undefined)[] = [];
    const spy: Validation = {
      condition: (_heading, { precedingMatches }) => {
        nearestPrecedingTexts.push(precedingMatches('h1, h2')[0]?.textContent ?? undefined);
        return true;
      },
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'document',
      selector: 'h2',
      severity: 'info',
    };
    const title = document.createElement('div');
    title.innerHTML = '<h1>Titel</h1>';
    fragment.innerHTML = '<h2>Kop</h2>';

    new Validator({ validations: [spy] }).validate([title, fragment]);

    expect(nearestPrecedingTexts).toEqual(['Titel']);
  });

  it('binds the focus and correction a validation offers to the element each violation flagged', () => {
    const acted: [string, Element][] = [];
    const spy: Validation = {
      condition: () => false,
      correction: { execute: (paragraph) => () => acted.push(['correction', paragraph]) },
      focus: (paragraph) => () => acted.push(['focus', paragraph]),
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'element',
      selector: 'p',
      severity: 'info',
    };
    fragment.innerHTML = '<p>Een</p><p>Twee</p>';
    const [first, second] = fragment.querySelectorAll('p');

    const violations = new Validator({ validations: [spy] }).validate([fragment]);
    violations[1]?.focus?.();
    violations[0]?.correction?.execute();

    expect(acted).toEqual([
      ['focus', second],
      ['correction', first],
    ]);
  });

  it('resolves the correction label into the active locale', () => {
    const spy: Validation = {
      condition: () => false,
      correction: { execute: () => () => {}, label: { en: 'Edit', nl: 'Bewerken' } },
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'element',
      selector: 'p',
      severity: 'info',
    };

    const [violation] = new Validator({ locale: 'en', validations: [spy] }).validate([fragment]);

    expect(violation?.correction?.label).toBe('Edit');
  });

  it('falls back to the fallback locale for a correction label', () => {
    const spy: Validation = {
      condition: () => false,
      correction: { execute: () => () => {}, label: { nl: 'Bewerken' } },
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'element',
      selector: 'p',
      severity: 'info',
    };

    const [violation] = new Validator({ fallbackLocale: 'nl', locale: 'en', validations: [spy] }).validate([fragment]);

    expect(violation?.correction?.label).toBe('Bewerken');
  });

  it('leaves the label out when the correction does not name one', () => {
    const spy: Validation = {
      condition: () => false,
      correction: { execute: () => () => {} },
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'element',
      selector: 'p',
      severity: 'info',
    };

    const [violation] = new Validator({ validations: [spy] }).validate([fragment]);

    expect(violation?.correction).not.toHaveProperty('label');
  });

  /** The absence of the key is what hosts branch on, so it has to be absent, not undefined. */
  it('reports no correction at all when the validation offers none', () => {
    const [violation] = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] }).validate([
      fragment,
    ]);

    expect(violation).not.toHaveProperty('correction');
  });

  it('offers no focus when the validation does not', () => {
    const [violation] = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] }).validate([
      fragment,
    ]);

    expect(violation?.focus).toBeUndefined();
  });

  it('hands a document validation the same context in payload, focus and correction', () => {
    const nearestPrecedingTexts: (string | undefined)[] = [];
    const spy: Validation = {
      condition: () => false,
      correction: {
        execute: (_paragraph, { precedingMatches }) => {
          nearestPrecedingTexts.push(precedingMatches('h1')[0]?.textContent ?? undefined);
          return () => {};
        },
      },
      focus: (_paragraph, { precedingMatches }) => {
        nearestPrecedingTexts.push(precedingMatches('h1')[0]?.textContent ?? undefined);
        return () => {};
      },
      messages: { nl: { error: 'x' } },
      payload: (_paragraph, { precedingMatches }) => {
        nearestPrecedingTexts.push(precedingMatches('h1')[0]?.textContent ?? undefined);
        return {};
      },
      rule: 'SPY',
      scope: 'document',
      selector: 'p',
      severity: 'info',
    };
    fragment.innerHTML = '<h1>Titel</h1><p>tekst</p>';

    new Validator({ validations: [spy] }).validate([fragment]);

    expect(nearestPrecedingTexts).toEqual(['Titel', 'Titel', 'Titel']);
  });

  it('reports violations across fragments in the order they are given', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });
    const [first, second] = [document.createElement('div'), document.createElement('div')];
    first.innerHTML = '<p id="first"></p>';
    second.innerHTML = '<p id="second"></p>';
    document.body.replaceChildren(second, first);

    expect(validator.validate([first, second]).map(({ element }) => element.id)).toEqual(['first', 'second']);
  });

  it('runs document validations over the composed content it is given', () => {
    const validator = new Validator({ validations: [coreValidations[HEADING_MUST_START_AT_LEVEL_ONE]] });
    fragment.innerHTML = '<h2>Kop</h2>';

    expect(validator.validate([fragment]).map(({ rule }) => rule)).toEqual([HEADING_MUST_START_AT_LEVEL_ONE]);
  });

  it('judges content without its document against a proxy content fragment holding the outline above it', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });
    const outline = document.createElement('div');
    outline.innerHTML = '<h1>Titel</h1><h2>Sectie</h2>';
    fragment.innerHTML = '<h3>Kop</h3><h4></h4>';

    expect(validator.validate([outline, fragment]).map(({ rule }) => rule)).toEqual([HEADING_MUST_NOT_BE_EMPTY]);
  });

  it('reports only element findings when the host leaves document validations out', () => {
    const validator = new Validator({
      validations: Object.values(coreValidations).filter(({ scope }) => scope === 'element'),
    });
    fragment.innerHTML = '<h2>Kop</h2><h4></h4>';

    expect(validator.validate([fragment]).map(({ rule }) => rule)).toEqual([HEADING_MUST_NOT_BE_EMPTY]);
  });
});
