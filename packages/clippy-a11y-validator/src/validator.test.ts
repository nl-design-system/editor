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

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement('div');
  root.innerHTML = '<p><strong>Vetgedrukt</strong></p><p> </p>';
  document.body.replaceChildren(root);
});

describe('Validator', () => {
  it('only reports the cherry-picked validation', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });

    expect(validator.validate([root]).map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('reports every core validation when all of them are registered', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });

    expect(validator.validate([root]).map(({ rule }) => rule)).toEqual([
      PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('reports violations in document order', () => {
    const validator = new Validator({
      validations: [coreValidations[HEADING_MUST_NOT_BE_EMPTY], coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]],
    });
    root.innerHTML = '<p></p><h1></h1><p></p>';

    expect(validator.validate([root]).map(({ element }) => element.tagName)).toEqual(['P', 'H1', 'P']);
  });

  it('reports several violations on the same element in registration order', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });
    root.innerHTML = '<table><tbody><tr><td>Paspoort</td></tr></tbody></table>';

    expect(validator.validate([root]).map(({ rule }) => rule)).toEqual([
      TABLE_MUST_HAVE_HEADINGS,
      TABLE_MUST_HAVE_MULTIPLE_ROWS,
    ]);
  });

  it('replaces a validation registered under an existing rule', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });
    validator.register({ ...coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY], severity: 'error' });

    expect(validator.validate([root]).map(({ severity }) => severity)).toEqual(['error']);
  });

  it('stops reporting a validation after it is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);

    expect(validator.validate([root])).toHaveLength(1);
    unregister();
    expect(validator.validate([root])).toHaveLength(0);
  });

  it('leaves a replacement in place when the replaced validation is unregistered', () => {
    const validator = new Validator();
    const unregister = validator.register(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    validator.register({ ...coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY], severity: 'error' });
    unregister();

    expect(validator.validate([root]).map(({ severity }) => severity)).toEqual(['error']);
  });

  it('skips validations outside the requested severities', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });

    expect(validator.validate([root], { severities: ['info'] }).map(({ rule }) => rule)).toEqual([
      PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING,
      PARAGRAPH_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('falls back to the default locale when the requested locale has no messages', () => {
    const validator = new Validator({ locale: 'en', validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });

    expect(validator.validate([root])[0]?.messages.error).toBe('Deze alinea is leeg.');
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
    root.innerHTML = '<h1>Een</h1>';

    new Validator({ validations: [spy] }).validate([root]);

    expect(received).toEqual([[root.querySelector('h1')]]);
  });

  it('lets a page validation read the nearest earlier match across roots, in the order the roots are given', () => {
    const seen: (string | undefined)[] = [];
    const spy: Validation = {
      condition: (_heading, { precedingMatches }) => {
        seen.push(precedingMatches('h1, h2')[0]?.textContent ?? undefined);
        return true;
      },
      messages: { nl: { error: 'x' } },
      rule: 'SPY',
      scope: 'page',
      selector: 'h2',
      severity: 'info',
    };
    const title = document.createElement('div');
    title.innerHTML = '<h1>Titel</h1>';
    root.innerHTML = '<h2>Kop</h2>';

    new Validator({ validations: [spy] }).validate([title, root]);

    expect(seen).toEqual(['Titel']);
  });

  it('hands a page validation the same context in payload and correct', () => {
    const seen: (string | undefined)[] = [];
    const spy: Validation = {
      condition: () => false,
      correct: (_paragraph, { precedingMatches }) => {
        seen.push(precedingMatches('h1')[0]?.textContent ?? undefined);
        return () => {};
      },
      messages: { nl: { error: 'x' } },
      payload: (_paragraph, { precedingMatches }) => {
        seen.push(precedingMatches('h1')[0]?.textContent ?? undefined);
        return {};
      },
      rule: 'SPY',
      scope: 'page',
      selector: 'p',
      severity: 'info',
    };
    root.innerHTML = '<h1>Titel</h1><p>tekst</p>';

    new Validator({ validations: [spy] }).validate([root]);

    expect(seen).toEqual(['Titel', 'Titel']);
  });

  it('reports violations across roots in the order the roots are given', () => {
    const validator = new Validator({ validations: [coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]] });
    const [first, second] = [document.createElement('div'), document.createElement('div')];
    first.innerHTML = '<p id="first"></p>';
    second.innerHTML = '<p id="second"></p>';
    document.body.replaceChildren(second, first);

    expect(validator.validate([first, second]).map(({ element }) => element.id)).toEqual(['first', 'second']);
  });

  it('runs page validations over the roots it is given', () => {
    const validator = new Validator({ validations: [coreValidations[HEADING_MUST_START_AT_LEVEL_ONE]] });
    root.innerHTML = '<h2>Kop</h2>';

    expect(validator.validate([root]).map(({ rule }) => rule)).toEqual([HEADING_MUST_START_AT_LEVEL_ONE]);
  });

  it('judges content without its page against a proxy root holding the outline above it', () => {
    const validator = new Validator({ validations: Object.values(coreValidations) });
    const outline = document.createElement('div');
    outline.innerHTML = '<h1>Titel</h1><h2>Sectie</h2>';
    root.innerHTML = '<h3>Kop</h3><h4></h4>';

    expect(validator.validate([outline, root]).map(({ rule }) => rule)).toEqual([HEADING_MUST_NOT_BE_EMPTY]);
  });

  it('reports only element findings when the host leaves page validations out', () => {
    const validator = new Validator({
      validations: Object.values(coreValidations).filter(({ scope }) => scope === 'element'),
    });
    root.innerHTML = '<h2>Kop</h2><h4></h4>';

    expect(validator.validate([root]).map(({ rule }) => rule)).toEqual([HEADING_MUST_NOT_BE_EMPTY]);
  });
});
