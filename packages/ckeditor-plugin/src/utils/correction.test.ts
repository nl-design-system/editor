import type { ValidationResult } from '@nl-design-system-community/editor/validators';
import type { ValidationsMap } from '@nl-design-system-community/editor/validators';
import { describe, expect, it, vi } from 'vitest';
import { findMatchingCorrection, findOccurrenceIndex, runValidations } from './correction.ts';

const range = (id?: string) => ({ id }) as unknown as Range;

const result = (validatorKey: string, correct?: () => void): ValidationResult => ({
  correct,
  severity: 'error',
  validatorKey,
});

describe('findOccurrenceIndex', () => {
  it('returns 0 for the only match', () => {
    const r = range();
    const map: ValidationsMap = new Map([[r, result('key', vi.fn())]]);
    expect(findOccurrenceIndex(map, r, 'key')).toBe(0);
  });

  it('returns 1 for the second match of the same key', () => {
    const r1 = range('a');
    const r2 = range('b');
    const map: ValidationsMap = new Map([
      [r1, result('key', vi.fn())],
      [r2, result('key', vi.fn())],
    ]);
    expect(findOccurrenceIndex(map, r2, 'key')).toBe(1);
  });

  it('does not count results without a correct function', () => {
    const r1 = range('a');
    const r2 = range('b');
    const map: ValidationsMap = new Map([
      [r1, result('key')],
      [r2, result('key', vi.fn())],
    ]);
    expect(findOccurrenceIndex(map, r2, 'key')).toBe(0);
  });

  it('does not count results with a different validatorKey', () => {
    const r1 = range('a');
    const r2 = range('b');
    const map: ValidationsMap = new Map([
      [r1, result('other', vi.fn())],
      [r2, result('key', vi.fn())],
    ]);
    expect(findOccurrenceIndex(map, r2, 'key')).toBe(0);
  });

  it('returns 0 when range is not in the map', () => {
    const r1 = range('a');
    const r2 = range('b');
    const map: ValidationsMap = new Map([[r1, result('key', vi.fn())]]);
    expect(findOccurrenceIndex(map, r2, 'key')).toBe(0);
  });
});

describe('findMatchingCorrection', () => {
  it('returns undefined when no matching result exists', () => {
    expect(findMatchingCorrection(new Map(), 'key', 0)).toBeUndefined();
  });

  it('returns undefined when occurrenceIndex exceeds available matches', () => {
    const map: ValidationsMap = new Map([[range(), result('key', vi.fn())]]);
    expect(findMatchingCorrection(map, 'key', 1)).toBeUndefined();
  });

  it('returns undefined for results without a correct function', () => {
    const map: ValidationsMap = new Map([[range(), result('key')]]);
    expect(findMatchingCorrection(map, 'key', 0)).toBeUndefined();
  });

  it('returns the matching correctable result', () => {
    const correct = vi.fn();
    const target = result('key', correct);
    const map: ValidationsMap = new Map([[range(), target]]);
    expect(findMatchingCorrection(map, 'key', 0)).toBe(target);
  });

  it('returns the result at the requested occurrence index', () => {
    const first = result('key', vi.fn());
    const second = result('key', vi.fn());
    const map: ValidationsMap = new Map([
      [range('a'), first],
      [range('b'), second],
    ]);
    expect(findMatchingCorrection(map, 'key', 1)).toBe(second);
  });
});

describe('runValidations', () => {
  it('returns a Map', () => {
    const dom = document.createElement('div');
    const result = runValidations(dom, { enableRules: ['*'], topHeadingLevel: 1 });
    expect(result).toBeInstanceOf(Map);
  });

  it('returns an empty map for content with no issues', () => {
    const dom = document.createElement('div');
    dom.innerHTML = '<h1>Title</h1><p>Valid paragraph.</p>';
    const result = runValidations(dom, { enableRules: ['*'], topHeadingLevel: 1 });
    expect(result.size).toBe(0);
  });

  it('returns a non-empty map for content with a validation issue', () => {
    const dom = document.createElement('div');
    dom.innerHTML = '<h2></h2>';
    document.body.appendChild(dom);
    const result = runValidations(dom, { enableRules: ['HEADING_MUST_NOT_BE_EMPTY'], topHeadingLevel: 1 });
    document.body.removeChild(dom);
    expect(result.size).toBeGreaterThan(0);
  });
});
