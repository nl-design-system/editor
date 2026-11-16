import { describe, expect, it } from 'vitest';
import { getAlternativeCorrections, getPrimaryCorrection } from './corrections.ts';

const primary = { execute: () => {} };
const first = { execute: () => {}, label: 'First alternative' };
const second = { execute: () => {}, label: 'Second alternative' };

describe('getPrimaryCorrection', () => {
  it('is the first correction', () => {
    expect(getPrimaryCorrection([primary, first, second])).toBe(primary);
  });

  it('is undefined without corrections', () => {
    expect(getPrimaryCorrection(undefined)).toBeUndefined();
    expect(getPrimaryCorrection([])).toBeUndefined();
  });
});

describe('getAlternativeCorrections', () => {
  it('is every correction after the primary one, in order', () => {
    expect(getAlternativeCorrections([primary, first, second])).toEqual([first, second]);
  });

  it('is empty when there is no alternative', () => {
    expect(getAlternativeCorrections(undefined)).toEqual([]);
    expect(getAlternativeCorrections([primary])).toEqual([]);
  });
});
