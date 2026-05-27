import { describe, it, expect } from 'vitest';
import { isEmptyOrWhitespace } from './helpers';

describe('isEmptyOrWhitespace', () => {
  it('returns true for an empty string', () => {
    expect(isEmptyOrWhitespace('')).toBe(true);
  });

  it('returns true for a string containing only spaces', () => {
    expect(isEmptyOrWhitespace('   ')).toBe(true);
  });

  it('returns true for a string containing only tabs and newlines', () => {
    expect(isEmptyOrWhitespace('\t\n\r')).toBe(true);
  });

  it('returns false for a string with visible characters', () => {
    expect(isEmptyOrWhitespace('hello')).toBe(false);
  });

  it('returns false for a string with leading and trailing whitespace around text', () => {
    expect(isEmptyOrWhitespace('  hello  ')).toBe(false);
  });

  it('returns true for a non-breaking space (matched by \\s)', () => {
    expect(isEmptyOrWhitespace('\u00A0')).toBe(true);
  });
});
