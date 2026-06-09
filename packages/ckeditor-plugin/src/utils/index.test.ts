import type { ValidationResult } from '@nl-design-system-community/editor/validators';
import { describe, expect, it } from 'vitest';
import { toResults } from './index.ts';

describe('toResults', () => {
  it('converts a Map to an array of its values', () => {
    const range = {} as Range;
    const result: ValidationResult = { severity: 'error', validatorKey: 'TEST' };
    expect(toResults(new Map([[range, result]]))).toEqual([result]);
  });

  it('returns an empty array for an empty map', () => {
    expect(toResults(new Map())).toEqual([]);
  });

  it('preserves insertion order', () => {
    const r1: ValidationResult = { severity: 'error', validatorKey: 'A' };
    const r2: ValidationResult = { severity: 'warning', validatorKey: 'B' };
    const map = new Map<Range, ValidationResult>([
      [{} as Range, r1],
      [{} as Range, r2],
    ]);
    expect(toResults(map)).toEqual([r1, r2]);
  });
});
