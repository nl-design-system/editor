import {
  coreValidations,
  defineValidation,
  type Validation,
  validationSeverity,
} from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from './index';
import '@/components/content';
import './index';

/** A rule the core set does not cover, so its presence proves the host's own set was used. */
const paragraphMustNotShout = defineValidation({
  condition: (paragraph) => {
    const text = paragraph.textContent ?? '';
    return text.trim() === '' || text !== text.toUpperCase();
  },
  messages: { nl: { error: 'Deze alinea staat volledig in hoofdletters.' } },
  rule: 'PARAGRAPH_MUST_NOT_SHOUT',
  scope: 'element',
  selector: 'p',
  severity: validationSeverity.WARNING,
});

const CONTENT = '<h1>Titel</h1><p>LET OP</p><p></p>';

/** Longer than the validation debounce, so a re-run triggered by an edit has landed. */
const VALIDATION_SETTLE_MS = 1500;

/**
 * `validations` is read once, when the editor is built, so it is assigned here before the first
 * update rather than after — the same moment a host script gets, right after the markup parses.
 */
const render = async (attributes = '', validations?: readonly Validation[]): Promise<Context> => {
  document.body.innerHTML = `
    <clippy-context id="validations-property-test" ${attributes}>
      <div slot="value">${CONTENT}</div>
      <clippy-content></clippy-content>
    </clippy-context>`;

  const context = document.querySelector('clippy-context') as Context;
  if (validations) context.validations = validations;
  await context.updateComplete;
  return context;
};

const rulesOf = (context: Context): string[] => [...context.violationsContext.values()].map(({ rule }) => rule);

const settled = async (context: Context): Promise<void> => {
  await vi.waitFor(() => expect(context.violationsContext.size).toBeGreaterThan(0));
};

beforeEach(() => {
  document.documentElement.lang = 'nl';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<clippy-context> validations property', () => {
  it('runs every core validation when none are given', async () => {
    const context = await render();
    await settled(context);

    expect(rulesOf(context)).toContain('PARAGRAPH_SHOULD_NOT_BE_EMPTY');
    expect(rulesOf(context)).not.toContain('PARAGRAPH_MUST_NOT_SHOUT');
  });

  it('runs only the core validations it is given', async () => {
    const context = await render('', [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    await settled(context);

    expect(rulesOf(context)).toEqual(['PARAGRAPH_SHOULD_NOT_BE_EMPTY']);
  });

  it('runs a validation the host wrote itself', async () => {
    const context = await render('', [paragraphMustNotShout]);
    await settled(context);

    expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
  });

  it('keeps the validations it started with when the content is edited', async () => {
    const context = await render('', [paragraphMustNotShout]);
    await settled(context);

    context.editor?.commands.insertContent('x');
    await new Promise((resolve) => {
      setTimeout(resolve, VALIDATION_SETTLE_MS);
    });

    expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
  });

  it('stays on the set it was built with when the property is assigned later', async () => {
    const context = await render();
    await settled(context);
    const before = rulesOf(context);

    context.validations = [paragraphMustNotShout];
    await context.updateComplete;
    await new Promise((resolve) => {
      setTimeout(resolve, VALIDATION_SETTLE_MS);
    });

    expect(rulesOf(context)).toEqual(before);
  });

  it('reports nothing when given an empty set', async () => {
    const context = await render('', []);
    await context.updateComplete;

    expect(context.violationsContext.size).toBe(0);
  });

  it('reads the property in readonly mode, where there is no editor', async () => {
    const context = await render('readonly', [paragraphMustNotShout]);
    await settled(context);

    expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
  });
});
