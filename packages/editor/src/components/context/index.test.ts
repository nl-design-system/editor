import { defineValidation, validationSeverity } from '@nl-design-system-community/clippy-a11y-validator';
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
  scope: 'block',
  selector: 'p',
  severity: validationSeverity.WARNING,
});

const CONTENT = '<h1>Titel</h1><p>LET OP</p><p></p>';

const render = async (attributes = ''): Promise<Context> => {
  document.body.innerHTML = `
    <clippy-context id="validations-property-test" ${attributes}>
      <div slot="value">${CONTENT}</div>
      <clippy-content></clippy-content>
    </clippy-context>`;

  const context = document.querySelector('clippy-context') as Context;
  await context.updateComplete;
  return context;
};

const rulesOf = (context: Context): string[] => [...context.validationsContext.values()].map(({ rule }) => rule);

const settled = async (context: Context): Promise<void> => {
  await vi.waitFor(() => expect(context.validationsContext.size).toBeGreaterThan(0));
};

beforeEach(() => {
  document.documentElement.lang = 'nl';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<clippy-context> validations property', () => {
  it('runs the core validations when none are given', async () => {
    const context = await render();
    await settled(context);

    expect(rulesOf(context)).toContain('PARAGRAPH_SHOULD_NOT_BE_EMPTY');
    expect(rulesOf(context)).not.toContain('PARAGRAPH_MUST_NOT_SHOUT');
  });

  it('runs the validations set on the property instead of the core set', async () => {
    const context = await render();
    await settled(context);

    context.validations = [paragraphMustNotShout];
    await context.updateComplete;

    await vi.waitFor(() => expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']));
  });

  it('re-runs when the property is set after the editor exists', async () => {
    const context = await render();
    await settled(context);
    const before = context.validationsContext;

    context.validations = [paragraphMustNotShout];
    await context.updateComplete;

    await vi.waitFor(() => expect(context.validationsContext).not.toBe(before));
  });

  it('still filters a property-supplied set by disable-rules', async () => {
    const context = await render();
    await settled(context);

    context.validations = [paragraphMustNotShout];
    context.disableRules = ['paragraph-must-not-shout'];
    await context.updateComplete;

    await vi.waitFor(() => expect(context.validationsContext.size).toBe(0));
  });

  it('reacts to the property in readonly mode, where there is no editor', async () => {
    const context = await render('readonly');
    await settled(context);

    context.validations = [paragraphMustNotShout];
    await context.updateComplete;

    await vi.waitFor(() => expect(rulesOf(context)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']));
  });
});
