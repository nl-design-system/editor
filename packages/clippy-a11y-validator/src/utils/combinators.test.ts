import { describe, expect, it } from 'vitest';
import { and, not, or } from './combinators.ts';

const isEven = (value: number): boolean => value % 2 === 0;
const isPositive = (value: number): boolean => value > 0;

describe('not', () => {
  it('inverts the result of a predicate', () => {
    expect(not(isEven)(2)).toBe(false);
    expect(not(isEven)(3)).toBe(true);
  });
});

describe('and', () => {
  it('is true only when every predicate holds', () => {
    expect(and(isEven, isPositive)(2)).toBe(true);
    expect(and(isEven, isPositive)(-2)).toBe(false);
    expect(and(isEven, isPositive)(3)).toBe(false);
  });

  it('is true without predicates', () => {
    expect(and<[number]>()(1)).toBe(true);
  });
});

describe('or', () => {
  it('is true when any predicate holds', () => {
    expect(or(isEven, isPositive)(-2)).toBe(true);
    expect(or(isEven, isPositive)(3)).toBe(true);
    expect(or(isEven, isPositive)(-3)).toBe(false);
  });

  it('is false without predicates', () => {
    expect(or<[number]>()(1)).toBe(false);
  });
});
