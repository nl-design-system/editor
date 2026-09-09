import { describe, expect, it } from 'vitest';
import type { ValidationMessagesByLocale } from './types/messages.ts';
import { resolveMessages } from './messages.ts';

const messages: ValidationMessagesByLocale = {
  en: { error: 'The {nodeType} is wrong.', solution: 'Fix it.', solutions: { heading: 'Use a heading.' } },
  nl: { error: 'De {nodeType} is fout.', solution: 'Herstel het.' },
};

describe('resolveMessages', () => {
  it('returns the requested locale', () => {
    expect(resolveMessages(messages, 'en', 'nl').error).toBe('The {nodeType} is wrong.');
  });

  it('falls back when the locale is missing', () => {
    expect(resolveMessages({ nl: messages.nl }, 'en', 'nl').error).toBe('De {nodeType} is fout.');
  });

  it('interpolates payload values into both messages', () => {
    const resolved = resolveMessages(messages, 'nl', 'nl', { nodeType: 'alinea' });
    expect(resolved.error).toBe('De alinea is fout.');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(resolveMessages(messages, 'nl', 'nl', { other: 1 }).error).toBe('De {nodeType} is fout.');
  });

  it('prefers the solution variant named by the payload', () => {
    expect(resolveMessages(messages, 'en', 'nl', { variant: 'heading' }).solution).toBe('Use a heading.');
  });

  it('falls back to the default solution for an unknown variant', () => {
    expect(resolveMessages(messages, 'en', 'nl', { variant: 'lead' }).solution).toBe('Fix it.');
  });

  it('omits the solution when there is none', () => {
    expect(resolveMessages({ nl: { error: 'Fout.' } }, 'nl', 'nl').solution).toBeUndefined();
  });
});
