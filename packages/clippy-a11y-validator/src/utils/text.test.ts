import { describe, expect, it } from 'vitest';
import { isEmptyOrWhitespace } from './text.ts';

describe('isEmptyOrWhitespace', () => {
  it('is true for empty and whitespace-only strings', () => {
    expect(isEmptyOrWhitespace('')).toBe(true);
    expect(isEmptyOrWhitespace(' \n\t ')).toBe(true);
  });

  it('is false once there is content', () => {
    expect(isEmptyOrWhitespace(' a ')).toBe(false);
  });
});
